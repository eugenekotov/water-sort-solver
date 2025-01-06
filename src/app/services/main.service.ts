import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { Color } from '../classes/model/colors.class';
import { PlayContainer } from '../classes/model/play-container.class';
import { SetupContainer } from '../classes/model/setup-container.class';
import { SolutionController } from '../classes/solution-controller.class';
import { TourService } from './tour.service';

// TODO: Add start page
type TMode = "setup" | "in-progress" | "no-solution" | "solve" | undefined;
export type TLang = "en" | "uk";

type TTheme = "light-theme" | "dark-theme";

@Injectable({
  providedIn: 'root'
})
export class MainService {

  public readonly TRANSITION_DURATION_MS = 500;
  public static readonly MAX_CONTAINER_COUNT = 14;
  public static readonly MIN_CONTAINER_COUNT = 4;
  public static readonly MAX_CONTAINER_COUNT_IN_LINE = 7;
  public static readonly DEFAULT_CONTAINER_COUNT = 7;
  public readonly TRANSITION_DURATION = (this.TRANSITION_DURATION_MS / 1000).toString() + "s";
  public readonly CONTAINER_SIZE = 4;
  public readonly OPACITY_DELAY = 300;
  public static readonly STORAGE_KEY = "water-sort-solver";

  public readonly itemWidthSmall: number = 25;
  public readonly itemWidthLarge: number = 30;
  public readonly containerItemsGapSmall: number = 4;
  public readonly containerItemsGapLarge: number = 6;

  private theme: TTheme = "light-theme";
  private _isMobile: boolean = false;
  public screenChanged$: Subject<void> = new Subject<void>();
  public screenResized$: Subject<void> = new Subject<void>();

  public containerCount = MainService.DEFAULT_CONTAINER_COUNT;
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

  solutionController: SolutionController = new SolutionController();

  constructor(private translate: TranslateService, private tourService: TourService) {
    this.loadContainerCount();
    this.createSourceContainers();
    this.createSetupContainers();
    this.setLanguage();
  }

  get mode(): TMode {
    return this._mode;
  }

  setMode(mode: TMode): Promise<void> {
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

  get isMobile(): boolean {
    return this._isMobile;
  }

  set isMobile(value: boolean) {
    if (this._isMobile !== value) {
      this._isMobile = value;
      this.screenChanged$.next();
    }
  }

  changeLanguage(lang: TLang) {
    this.translate.use(lang);
    this.saveLang(lang);
  }

  currentLanguage(): TLang {
    return this.translate.currentLang as TLang;
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

  solve(setupContainers1: SetupContainer[], setupContainers2: SetupContainer[]) {
    this.setMode("in-progress").then(_ => {
      this.createPlayContainers();
      this.fillPlayContainers(setupContainers1, setupContainers2);
      this.solutionController.solve([...this.playContainers1, ...this.playContainers2]);
      if (this.solutionController.solutionCount() > 0) {
        // Print solution
        // this.solutionController.bestSolution!.steps.forEach((step, index) => console.log("Step " + index + ": " + step.iFrom + " -> "+ step.iTo));
        this.setMode("solve");
      } else {
        this.setMode("no-solution");
      }
    });
  }

  private createPlayContainers() {
    this.playContainers1 = [];
    this.playContainers2 = [];
    if (this.containerCount <= MainService.MAX_CONTAINER_COUNT_IN_LINE) {
      for (let i = 0; i < this.containerCount; i++) {
        this.playContainers1.push(new PlayContainer(i));
      }
    } else {
      const halfOfContainerCount = Math.ceil(this.containerCount / 2);
      for (let i = 0; i < halfOfContainerCount; i++) {
        this.playContainers1.push(new PlayContainer(i));
      }
      for (let i = halfOfContainerCount; i < this.containerCount; i++) {
        this.playContainers2.push(new PlayContainer(i));
      }
    }
  }


  public stopProgress() {
    // TODO: implement progress interaption
    this.setMode("setup");
  }


  public fillPlayContainers(setupContainers1: SetupContainer[], setupContainers2: SetupContainer[]) {
    this.clearPlayContainers();
    setupContainers1.forEach((setupContainer, containerIndex) => {
      setupContainer.colors.forEach((color, itemIndex) => this.playContainers1[containerIndex].items[setupContainer.colors.length - 1 - itemIndex].color = color);
    });
    setupContainers2.forEach((setupContainer, containerIndex) => {
      setupContainer.colors.forEach((color, itemIndex) => this.playContainers2[containerIndex].items[setupContainer.colors.length - 1 - itemIndex].color = color);
    });
  }

  private clearPlayContainers() {
    this.playContainers1.forEach(container => container.clear());
    this.playContainers2.forEach(container => container.clear());
  }

  public createSetupContainers() {
    this.setupContainers1 = [];
    this.setupContainers2 = [];
    for (let i = 0; i < this.containerCount; i++) {
      this.setupContainers1.push({ id: 'setup-container' + i, colors: [] });
    }
    this.balanceSetupContainers();
  }

  public balanceSetupContainers() {
    if (this.containerCount <= MainService.MAX_CONTAINER_COUNT_IN_LINE) {
      this.setupContainers1 = [...this.setupContainers1, ...this.setupContainers2];
      this.setupContainers2 = [];
    } else {
      const allContainers = [...this.setupContainers1, ...this.setupContainers2];
      this.setupContainers1 = [];
      this.setupContainers2 = [];
      const halfOfContainerCount = Math.ceil(this.containerCount / 2);
      for (let i = 0; i < halfOfContainerCount; i++) {
        this.setupContainers1.push(allContainers[i]);
      }
      for (let i = halfOfContainerCount; i < this.containerCount; i++) {
        this.setupContainers2.push(allContainers[i]);
      }
    }
  }

  public createSourceContainers() {
    this.sourceContainers = [];
    Object.values(Color).forEach((color, index) => {
      if (index < this.containerCount - 2) {
        this.sourceContainers.push({ id: 'source-container' + index, colors: [color, color, color, color] });
      }
    });
  }

  private loadContainerCount() {
    let loadedValue: number = Number(localStorage.getItem(MainService.STORAGE_KEY + "-containers"));
    if (!loadedValue || loadedValue < MainService.MIN_CONTAINER_COUNT) {
      loadedValue = MainService.DEFAULT_CONTAINER_COUNT;
    }
    this.containerCount = loadedValue;
  }

  saveContainerCount() {
    localStorage.setItem(MainService.STORAGE_KEY + "-containers", String(this.containerCount));
  }

  private setLanguage() {
    this.translate.setDefaultLang('en');
    let lang = this.loadLang();
    if (!lang) {
      const browserLang = this.translate.getBrowserLang();
      lang = (browserLang?.match(/en|uk/) ? browserLang : 'en') as TLang;
    }
    this.changeLanguage(lang);
  }

  private saveLang(lang: TLang) {
    localStorage.setItem(MainService.STORAGE_KEY + "-lang", lang as string);
  }

  private loadLang(): TLang | undefined {
    const value = localStorage.getItem(MainService.STORAGE_KEY + "-lang");
    if (value) {
      return value as TLang;
    }
    return undefined;
  }

  changeTheme() {
    document.body.classList.remove(this.theme);
    this.theme = this.theme === "dark-theme" ? "light-theme" : "dark-theme";
    document.body.classList.add(this.theme);
  }


}
