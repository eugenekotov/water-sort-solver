import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { Color } from '../classes/model/colors.class';
import { PlayContainer } from '../classes/model/play-container.class';
import { SetupContainer } from '../classes/model/setup-container.class';
import { Solution } from '../classes/model/solution-set.class';
import { EWorkerResult, SolutionController, WorkerResult } from '../classes/solution-controller.class';
import { TourService } from './tour.service';
import { DEFAULT_CONTAINER_COUNT, MAX_CONTAINER_COUNT_IN_LINE, MIN_CONTAINER_COUNT, OPACITY_DELAY, STORAGE_KEY } from '../classes/model/const.class';
import { SourceItem } from '../classes/model/item.class';

type TView = "menu" | "setup" | "in-progress" | "no-solution" | "solve" | "play" | "settings";
export type TLang = "en" | "uk";

type TTheme = "light-theme" | "dark-theme";

@Injectable({
  providedIn: 'root'
})
export class MainService {

  public readonly itemWidthSmall: number = 25;
  public readonly itemWidthLarge: number = 30;
  public readonly containerItemsGapSmall: number = 4;
  public readonly containerItemsGapLarge: number = 6;

  theme: TTheme = "light-theme";
  private _isMobile: boolean = false;
  public screenChanged$: Subject<void> = new Subject<void>();
  public screenResized$: Subject<void> = new Subject<void>();

  public containerCount = DEFAULT_CONTAINER_COUNT;
  sourceItems: SourceItem[] = [];
  setupContainers1: SetupContainer[] = [];
  setupContainers2: SetupContainer[] = [];

  readonly minSpeed = 1;
  readonly maxSpeed = 20;
  readonly defaultSpeed = 5;
  speed: number = this.defaultSpeed;

  private _view: TView | undefined = undefined;
  visible: Map<TView, boolean> = new Map<TView, boolean>();

  playContainers1: PlayContainer[] = [];
  playContainers2: PlayContainer[] = [];

  solutionController: SolutionController = new SolutionController();
  solution: Solution;

  constructor(private translate: TranslateService, private tourService: TourService) {
    this.loadContainerCount();
    this.createSourceContainers();
    this.createSetupContainers();
    this.setLanguage();
    this.loadSpeed();
  }

  get view(): TView | undefined {
    return this._view;
  }

  setView(view: TView): Promise<void> {
    return new Promise<void>(resolve => {
      this.setVisible(false);
      setTimeout(() => {
        this._view = view;
        setTimeout(() => {
          this.setVisible(true);
          setTimeout(() => {
            resolve();
          }, OPACITY_DELAY);
        }, 100)
      }, OPACITY_DELAY);
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
    this.visible.set(this._view!, value);
  }

  solve(setupContainers1: SetupContainer[], setupContainers2: SetupContainer[]) {
    this.setView("in-progress").then(_ => {
      this.createPlayContainers();
      this.fillPlayContainers(setupContainers1, setupContainers2);
      this.solutionController.solve([...this.playContainers1, ...this.playContainers2]).subscribe((result: WorkerResult) => {
        if (result.result === EWorkerResult.SOLUTION) {
          this.solution = result.solution!;
          this.setView("solve");
        } else if (result.result === EWorkerResult.BEST_SOLUTION) {
          this.solution = result.solution!;
          this.setView("solve");
        } else if (result.result === EWorkerResult.NO_SOLUTION) {
          this.setView("no-solution");
        } else if (result.result === EWorkerResult.CANCEL) {
          this.setView("setup");
        } else {
          const n: never = result.result;
        }
      });
    });
  }

  private createPlayContainers() {
    this.playContainers1 = [];
    this.playContainers2 = [];
    if (this.containerCount <= MAX_CONTAINER_COUNT_IN_LINE) {
      for (let i = 0; i < this.containerCount; i++) {
        this.playContainers1.push(PlayContainer.create(i));
      }
    } else {
      const halfOfContainerCount = Math.ceil(this.containerCount / 2);
      for (let i = 0; i < halfOfContainerCount; i++) {
        this.playContainers1.push(PlayContainer.create(i));
      }
      for (let i = halfOfContainerCount; i < this.containerCount; i++) {
        this.playContainers2.push(PlayContainer.create(i));
      }
    }
  }

  public fillPlayContainers(setupContainers1: SetupContainer[], setupContainers2: SetupContainer[]) {
    setupContainers1.forEach((setupContainer, containerIndex) => {
      setupContainer.colors.forEach((color, itemIndex) => this.playContainers1[containerIndex].items[setupContainer.colors.length - 1 - itemIndex].color = color);
      PlayContainer.afterChange(this.playContainers1[containerIndex]);
    });

    setupContainers2.forEach((setupContainer, containerIndex) => {
      setupContainer.colors.forEach((color, itemIndex) => this.playContainers2[containerIndex].items[setupContainer.colors.length - 1 - itemIndex].color = color);
      PlayContainer.afterChange(this.playContainers2[containerIndex]);
    });
  }

  private createSourceContainers() {
    this.sourceItems = [];
    Object.values(Color).forEach((color, index) => {
      if (index < this.containerCount - 2) {
        this.sourceItems.push(new SourceItem(color));
      }
    });
  }

  createSetupContainers() {
    this.setupContainers1 = [];
    this.setupContainers2 = [];
    for (let i = 0; i < this.containerCount; i++) {
      this.setupContainers1.push({ id: 'setup-container' + i, colors: [] });
    }
    this.balanceSetupContainers();
  }

  balanceSetupContainers() {
    if (this.containerCount <= MAX_CONTAINER_COUNT_IN_LINE) {
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

  private loadContainerCount() {
    let loadedValue: number = Number(localStorage.getItem(STORAGE_KEY + "-containers"));
    if (!loadedValue || loadedValue < MIN_CONTAINER_COUNT) {
      loadedValue = DEFAULT_CONTAINER_COUNT;
    }
    this.containerCount = loadedValue;
  }

  saveContainerCount() {
    localStorage.setItem(STORAGE_KEY + "-containers", String(this.containerCount));
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
    localStorage.setItem(STORAGE_KEY + "-lang", lang as string);
  }

  private loadLang(): TLang | undefined {
    const value = localStorage.getItem(STORAGE_KEY + "-lang");
    if (value) {
      return value as TLang;
    }
    return undefined;
  }

  changeTheme() {
    this.theme = this.theme === "dark-theme" ? "light-theme" : "dark-theme";
    this.applyTheme();
    this.saveTheme();
  }

  private applyTheme() {
    if (this.theme === "dark-theme") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }

  private saveTheme() {
    localStorage.setItem(STORAGE_KEY + "-theme", this.theme as string);
  }

  loadTheme() {
    const value = localStorage.getItem(STORAGE_KEY + "-theme");
    this.theme = value ? value as TTheme : "light-theme";
    this.applyTheme();
  }

  getSetupContainersItems() {
    let result = 0;
    this.setupContainers1.forEach(container => result = result + container.colors.length);
    this.setupContainers2.forEach(container => result = result + container.colors.length);
    return result;
  }

  play(setupContainers1: SetupContainer[], setupContainers2: SetupContainer[]) {
    this.createPlayContainers();
    this.fillPlayContainers(setupContainers1, setupContainers2);
    this.setView("play");
  }

  private loadSpeed() {
    let speed = Number(localStorage.getItem(STORAGE_KEY + "-speed"));
    if (speed < this.minSpeed || this.maxSpeed < speed) {
      speed = this.defaultSpeed;
    }
    this.speed = speed;
  }

  saveSpeed(speed: number) {
    localStorage.setItem(STORAGE_KEY + "-speed", String(speed));
  }

}
