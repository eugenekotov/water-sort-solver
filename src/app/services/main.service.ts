import { Injectable } from '@angular/core';
import { Color } from '../classes/model/colors.class';
import { Item } from '../classes/model/item.class';
import { PlayContainer } from '../classes/model/play-container.class';
import { SetupContainer } from '../classes/model/setup-container.class';
import { Solution } from '../classes/solution.class';
import { Subject } from 'rxjs';

type TMode = "setup" | "in-progress" | "no-solution" | "solve" | undefined;

@Injectable({
  providedIn: 'root'
})
export class MainService {

  public readonly TRANSITION_DURATION_MS = 500;
  public readonly TRANSITION_DURATION = (this.TRANSITION_DURATION_MS / 1000).toString() + "s";
  public readonly CONTAINER_SIZE = 4;
  public readonly OPACITY_DELAY = 300;
  public static readonly STORAGE_KEY = "water-sort-solver";

  public readonly itemWidthSmall: number = 25;
  public readonly itemWidthLarge: number = 30;
  public readonly containerItemsGapSmall: number = 4;
  public readonly containerItemsGapLarge: number = 6;

  private _isMobile: boolean = false;
  public screenChanged$: Subject<void> = new Subject<void>();

  // TODO: public containersCount = 14;
  public containersCount = 10;
  sourceContainers: SetupContainer[] = [];

  setupContainers1: SetupContainer[] = [];
  setupContainers2: SetupContainer[] = [];

  private _mode: TMode = undefined;
  visibleSetup: boolean = false;
  visibleInProgress: boolean = false;
  visibleNoSolution: boolean = false;
  visibleSolve: boolean = false;

  playContainers1: PlayContainer[] = [];
  playContainers2: PlayContainer[] = [];

  solution: Solution = new Solution();

  constructor() {
    this.createSourceContainers();
    this.createSetupContainers();
    this.createPlayContainers();
  }

  public get mode(): TMode {
    return this._mode;
  }

  public setMode(mode: TMode): Promise<void> {
    return new Promise<void>(resolve => {
      this.setVisible(false);
      setTimeout(() => {
        this._mode = mode;
        setTimeout(() => {
          this.setVisible(true);
          setTimeout(() => {
            resolve();
          }, this.OPACITY_DELAY);
        }, 100)
      }, this.OPACITY_DELAY);
    });
  }

  public get isMobile(): boolean {
    return this._isMobile;
  }

  public set isMobile(value: boolean) {
    if (this._isMobile !== value) {
      this._isMobile = value;
      this.screenChanged$.next();
    }

  }


  setVisible(value: boolean) {
    switch (this._mode) {
      case "setup":
        this.visibleSetup = value;
        break;

      case "in-progress":
        this.visibleInProgress = value;
        break;

      case "no-solution":
        this.visibleNoSolution = value;
        break;

      case "solve":
        this.visibleSolve = value;
        break;

      case undefined:
        break;

      default:
        const _n: never = this._mode;
    }
  }

  public solve(setupContainers1: SetupContainer[], setupContainers2: SetupContainer[]) {
    this.setMode("in-progress").then(_ => {
      this.fillBoard(setupContainers1, setupContainers2);
      if (this.solution.solve([...this.playContainers1, ...this.playContainers2])) {
        this.setMode("solve");
      } else {
        this.setMode("no-solution");
      }
    });
  }

  public stopProgress() {
    // TODO: implement progress interaption
    this.setMode("setup");
  }

  private createPlayContainers() {
    const halfContainersCount = Math.ceil(this.containersCount / 2);
    for (let i = 0; i < halfContainersCount; i++) {
      this.playContainers1.push(new PlayContainer(i));
    }
    for (let i = halfContainersCount; i < this.containersCount; i++) {
      this.playContainers2.push(new PlayContainer(i));
    }
  }

  public fillBoard(setupContainers1: SetupContainer[], setupContainers2: SetupContainer[]) {
    this.clearContainers();
    setupContainers1.forEach((setupContainer, containerIndex) => {
      setupContainer.colors.forEach((color, itemIndex) => this.playContainers1[containerIndex].items[setupContainer.colors.length - 1 - itemIndex].color = color);
    });
    setupContainers2.forEach((setupContainer, containerIndex) => {
      setupContainer.colors.forEach((color, itemIndex) => this.playContainers2[containerIndex].items[setupContainer.colors.length - 1 - itemIndex].color = color);
    });
  }

  private clearContainers() {
    this.playContainers1.forEach(container => container.clear());
    this.playContainers2.forEach(container => container.clear());
  }

  private createSetupContainers() {
    const halfContainersCount = Math.ceil(this.containersCount / 2);
    for (let i = 0; i < halfContainersCount; i++) {
      this.setupContainers1.push({ id: 'source-container' + i, colors: [] });
    }
    for (let i = halfContainersCount; i < this.containersCount; i++) {
      this.setupContainers2.push({ id: 'source-container' + i, colors: [] });
    }
  }

  public createSourceContainers() {
    this.sourceContainers = [];
    Object.values(Color).forEach((color, index) => {
      if (index < this.containersCount - 2) {
        this.sourceContainers.push({ id: 'container' + index, colors: [color, color, color, color] });
      }
    });
  }

}
