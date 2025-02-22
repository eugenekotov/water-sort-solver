import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { Game } from '../classes/model/game/game.class';
import { MAX_CONTAINER_COUNT, MAX_CONTAINER_COUNT_IN_LINE, OPACITY_DELAY, STORAGE_KEY } from '../classes/model/const.class';
import { PlayContainer } from '../classes/model/play-container.class';
import { Solution } from '../classes/model/solution-set.class';
import { EWorkerResult, SolutionController, WorkerResult } from '../classes/solution-controller.class';
import { TourService } from './tour.service';

export type TView = "menu" | "setup" | "in-progress" | "no-solution" | "solve" | "play" | "settings";
export type TLang = "en" | "uk";

type TTheme = "light-theme" | "dark-theme";

@Injectable({
  providedIn: 'root'
})
export class MainService {

  theme: TTheme = "light-theme";
  private _isMobile: boolean = false;
  public screenChanged$: Subject<void> = new Subject<void>();
  public screenResized$: Subject<void> = new Subject<void>();

  // public containerCount = DEFAULT_CONTAINER_COUNT;

  game: Game | undefined;

  readonly minSpeed = 1;
  readonly maxSpeed = 20;
  readonly defaultSpeed = 5;
  speed: number = this.defaultSpeed;

  private _view: TView | undefined = undefined;
  visible: Map<TView, boolean> = new Map<TView, boolean>();
  viewBeforeSettings: TView | undefined = undefined;

  playContainers1: PlayContainer[] = [];
  playContainers2: PlayContainer[] = [];

  solutionController: SolutionController = new SolutionController();
  solution: Solution;

  constructor(private translate: TranslateService, private tourService: TourService) {
    // this.loadContainerCount();
    this.setLanguage();
    this.loadSpeed();
    this.game = Game.createRandomGame(MAX_CONTAINER_COUNT - 2, MAX_CONTAINER_COUNT);
  }

  get view(): TView | undefined {
    return this._view;
  }

  setView(view: TView): Promise<void> {
    return new Promise<void>(resolve => {
      if (view === "settings") {
        // remember
        this.viewBeforeSettings = this._view;
      }
      this.hideView().then(() => {
        this._view = view;
        setTimeout(() => {
          this.showView().then(() => resolve());
        }, 0);
      });
    });
  }

  private hideView(): Promise<void> {
    return new Promise(resolve => {
      if (this._view === undefined) {
        // nothing to hide
        resolve();
      } else {
        this.visible.set(this._view!, false);
        setTimeout(() => resolve(), OPACITY_DELAY);
      }
    });
  }

  private showView(): Promise<void> {
    return new Promise(resolve => {
      this.visible.set(this._view!, true);
      setTimeout(() => resolve(), OPACITY_DELAY);
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

  solve(game: Game) {
    this.setView("in-progress").then(_ => {
      this.fillPlayContainers(game);
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

  public fillPlayContainers(game: Game) {
    this.playContainers1 = [];
    this.playContainers2 = [];
    game.containers.forEach((container, index) => {
      const playCountainer: PlayContainer = new PlayContainer(index);
      container.colors.forEach(color => playCountainer.push(color));
      this.playContainers1.push(playCountainer);
    });
    this.balancePlayContainers();
  }

  private balancePlayContainers() {
    const containerCount = this.playContainers1.length + this.playContainers2.length;
    if (containerCount <= MAX_CONTAINER_COUNT_IN_LINE) {
      this.playContainers1 = [...this.playContainers1, ...this.playContainers2];
      this.playContainers2 = [];
    } else {
      const allContainers = [...this.playContainers1, ...this.playContainers2];
      this.playContainers1 = [];
      this.playContainers2 = [];
      const halfOfContainerCount = Math.ceil(containerCount / 2);
      for (let i = 0; i < halfOfContainerCount; i++) {
        this.playContainers1.push(allContainers[i]);
      }
      for (let i = halfOfContainerCount; i < containerCount; i++) {
        this.playContainers2.push(allContainers[i]);
      }
    }
  }

  // private loadContainerCount() {
  //   let loadedValue: number = Number(localStorage.getItem(STORAGE_KEY + "-containers"));
  //   if (!loadedValue || loadedValue < MIN_CONTAINER_COUNT) {
  //     loadedValue = DEFAULT_CONTAINER_COUNT;
  //   }
  //   this.containerCount = loadedValue;
  // }

  // saveContainerCount() {
  //   localStorage.setItem(STORAGE_KEY + "-containers", String(this.containerCount));
  // }

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

  setTheme(theme: TTheme) {
    if (this.theme !== theme) {
      this.theme = theme;
      this.applyTheme();
      this.saveTheme();
    }
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

  play(game: Game) {
    this.fillPlayContainers(game);
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

  fullScreen() {

  }

}
