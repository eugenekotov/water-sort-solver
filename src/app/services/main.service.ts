import { Injectable } from '@angular/core';
import { Color } from '../classes/colors.class';
import { Item } from '../classes/item.class';
import { PlayContainer } from '../classes/play-container.class';
import { SetupContainer } from '../classes/setup-container.class';
import { Solution } from '../classes/solution.class';

type TMode = "setup" | "in-progress" | "no-solution" | "solve" | undefined;

@Injectable({
  providedIn: 'root'
})
export class MainService {

  private readonly CONTAINERS_COUNT = 14;
  public readonly TRANSITION_DURATION_MS = 500;
  public readonly TRANSITION_DURATION = (this.TRANSITION_DURATION_MS / 1000).toString() + "s";
  public readonly CONTAINER_SIZE = 4;
  public readonly OPACITY_DELAY = 300;

  sourceContainers: SetupContainer[] = [];
  setupContainers: SetupContainer[] = [];

  private _mode: TMode = undefined;
  visibleSetup: boolean = false;
  visibleInProgress: boolean = false;
  visibleNoSolution: boolean = false;
  visibleSolve: boolean = false;

  containers: PlayContainer[] = [];
  solution: Solution = new Solution();

  movingItem: Item; // Item for moving animation

  constructor() {
    this.createSourceContainers();
    this.createSetupContainers();
    this.createContainers();
    this.movingItem = new Item(undefined, 0, true);
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

  public solve(containers: SetupContainer[]) {
    this.setMode("in-progress").then(_ => {
      this.fillBoard(containers);
      if (this.solution.solve(this.containers)) {
        this.setMode("solve");
      } else {
        this.setMode("no-solution");
      }
    });
  }

  public stopProgress() {
    this.setMode("setup");
  }


  private createContainers() {
    for (let i = 0; i < this.CONTAINERS_COUNT; i++) {
      this.containers.push(new PlayContainer(i));
    }
  }

  public fillBoard(setupContainers: SetupContainer[]) {
    this.clearContainers();
    setupContainers.forEach((setupContainer, containerIndex) => {
      setupContainer.colors.forEach((color, itemIndex) => this.containers[containerIndex].items[PlayContainer.MAX_SIZE - 1 - itemIndex].color = color);
    });
  }

  private clearContainers() {
    this.containers.forEach(container => container.clear());
  }

  private createSetupContainers() {
    for (let i = 0; i < this.CONTAINERS_COUNT; i++) {
      this.setupContainers.push({ id: 'source-container' + i, colors: [] });
    }
  }

  public createSourceContainers() {
    this.sourceContainers = [];
    Object.values(Color).forEach((color, index) => {
      this.sourceContainers.push({ id: 'container' + index, colors: [color, color, color, color] });
    });
  }


}
