import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { concatMap, Observable, Subject, Subscription } from 'rxjs';
import { CONTAINER_SIZE, MAX_CONTAINER_COUNT, MAX_CONTAINER_COUNT_IN_LINE } from 'src/app/classes/model/const.class';
import { GameContainer } from 'src/app/classes/model/game/game-container.class';
import { PlayContainer } from 'src/app/classes/model/play-container.class';
import { MovingController } from 'src/app/classes/moving-controller.class';
import { Utils } from 'src/app/classes/utils.class';
import { GameService } from 'src/app/services/game.service';
import { MainService, TView } from 'src/app/services/main.service';


export class PlayStep {
  constructor(public iFrom: number, public iTo: number, public count: number) { }
}

@Component({
  selector: 'app-board-play',
  templateUrl: './board-play.component.html',
  styleUrls: ['./board-play.component.scss']
})
export class BoardPlayComponent implements AfterViewInit, OnDestroy {

  protected utils = Utils;
  protected readonly view: TView = 'play';

  private containers: GameContainer[];

  private playContainers: PlayContainer[] = [];
  protected playContainers1: PlayContainer[] = [];
  protected playContainers2: PlayContainer[] = [];
  private selectedContainer: PlayContainer | undefined;

  protected containersPositions1: GameContainer[] = [];
  protected containersPositions2: GameContainer[] = [];

  private screenResizedSubscription: Subscription | undefined = undefined;
  private containerHTMLElements: HTMLElement[] = []; // To get container by coordinates

  protected steps: PlayStep[] = [];

  protected completeStepIndex: number = 0;

  private clicksSubject$ = new Subject<PlayContainer>();
  private stopSubject$ = new Subject<void>();
  private stepsSubjectSubscription: Subscription;

  protected movingController = new MovingController(this.mainService);
  protected movingInProgress: boolean = false;

  constructor(public mainService: MainService, public gameService: GameService) {
    if (!this.gameService.hasGame()) {
      this.gameService.createRandomGame(MAX_CONTAINER_COUNT - 2, MAX_CONTAINER_COUNT);
    }
    this.containers = this.gameService.getContainers();
    this.prepareBoard();
  }

  ngAfterViewInit(): void {
    this.screenResizedSubscription = this.mainService.screenResized$.subscribe(() => {
      setTimeout(() => this.onScreenResized(), 500);
    });
    this.onScreenResized();
  }

  ngOnDestroy(): void {
    if (this.screenResizedSubscription) {
      this.screenResizedSubscription.unsubscribe();
    }
    this.stepsSubjectSubscription.unsubscribe();

  }

  private onScreenResized() {
    this.movingController.getHTMLElements(this.playContainers);
    this.getContainerHTMLElemets();
  }

  private createStepsSubject() {
    if (this.stepsSubjectSubscription) {
      this.stepsSubjectSubscription.unsubscribe();
    }
    this.clicksSubject$ = new Subject<PlayContainer>();
    this.stepsSubjectSubscription = this.clicksSubject$.pipe(
      concatMap(container => this.handleClick(container)))
      .subscribe({
        next: (step: PlayStep | undefined) => {
          if (step) {
            this.steps.push(step);
          }
          this.movingInProgress = false;
          // TODO: Here we need check is container or board resolved
        },
        error: () => {
          // Interrupted by button start from scratch or step back
          this.movingController.stoppingInProgress = false;
          this.movingInProgress = false;
          this.stepsSubjectSubscription.unsubscribe();
          this.createStepsSubject();
          this.stopSubject$.next();
        }
      });
  }

  private handleClick(container: PlayContainer): Observable<PlayStep | undefined> {
    return new Observable(observer => {
      this.movingInProgress = true;
      if (this.selectedContainer) {
        if (container.index === this.selectedContainer.index) {
          // Move colors back down
          const movingCount = this.movingController.getVisibleMovingItems().length;
          this.movingController.moveDown(container, 0, movingCount).subscribe(()=>{
            this.selectedContainer = undefined;
            observer.next();
            observer.complete();
          });
        } else {
          if (container.isEmpty() || ((!container.isFull()) && container.peek() === this.movingController.getColor())) {
            // Move colors if it is possible
            const visibleCount = this.movingController.getVisibleMovingItems().length;
            const movingToCount = Math.min(CONTAINER_SIZE - container.size(), visibleCount);
            const movingDownCount = visibleCount - movingToCount;
            const fromIndex = this.selectedContainer!.index;
            this.movingController.moveTo(container, movingToCount).subscribe(() => {
              this.movingController.moveDown(container, movingToCount, movingDownCount).subscribe(() => {
                this.selectedContainer = undefined;
                observer.next(new PlayStep(fromIndex, container.index, movingToCount));
                observer.complete();
              });
            });
          } else {
            const movingCount = this.movingController.getVisibleMovingItems().length;
            this.movingController.moveDown(this.selectedContainer, 0, movingCount).subscribe(()=>{
              this.selectedContainer = undefined;
              observer.next();
              observer.complete();
            });
          }
        }
      } else {
        if (this.movingController.stoppingInProgress) {
          observer.error({ message: "Stop" });
          return;
        }
        // No selected container
        if (!container.isEmpty()) {
          // We selected container, move colors up
          const movingCount = container.getTopColorCount();
          this.movingController.moveUp(container, movingCount).subscribe(()=> {
            this.selectedContainer = container;
            observer.next();
            observer.complete();
          });
        } else {
          observer.next();
          observer.complete();
        }
      }
    });
  }

  protected onContainerClick(event: any, container: PlayContainer) {
    this.clicksSubject$.next(container);
    event.stopPropagation();
  }

  protected backClick() {
    if (this.movingInProgress) {
      this.movingController.stoppingInProgress = true;
      const stopSubscriber = this.stopSubject$.subscribe(() => {
        stopSubscriber.unsubscribe();
        this.stepBack();
      });
    } else {
      if (this.selectedContainer) {
        const movingCount = this.movingController.getVisibleMovingItems().length;
        this.movingController.moveDown(this.selectedContainer!, 0, movingCount).subscribe(() => this.stepBack());
      } else {
        this.stepBack();
      }
    }
  }

  private stepBack() {
    const step = this.steps.pop();
    for (let i = 0; i < step!.count; i++) {
      this.playContainers[step!.iFrom].push(this.playContainers[step!.iTo].pop());
    }
  }

  protected restartClick() {
    // TODO: Ask confirmation
    if (this.movingInProgress) {
      this.movingController.stoppingInProgress = true;
      setTimeout(() => {
        const stopSubscriber = this.stopSubject$.subscribe(() => {
          stopSubscriber.unsubscribe();
          this.prepareBoard();
        });
      }, 0);
    } else {
      this.prepareBoard();
    }
  }

  private prepareBoard() {
    this.playContainers1 = [];
    this.playContainers2 = [];
    const containerCount = this.containers.length;
    let container1Count = containerCount;
    if (containerCount > MAX_CONTAINER_COUNT_IN_LINE) {
      container1Count = Math.ceil(containerCount / 2);
    }
    this.containers.forEach((container, index) => {
      const playCountainer: PlayContainer = new PlayContainer(index);
      container.colors.forEach(color => playCountainer.push(color));
      if (index < container1Count) {
        this.playContainers1.push(playCountainer);
      } else {
        this.playContainers2.push(playCountainer);
      }
    });
    this.playContainers = [...this.playContainers1, ...this.playContainers2];
    this.steps = [];
    this.createStepsSubject();
    this.movingInProgress = false;
    this.movingController.stoppingInProgress = false;
    this.movingController.setHidden(this.movingController.movingItems, true);
    setTimeout(() => this.onScreenResized(), 0);
  }

  protected onClick(event: any) {
    const x = event.clientX;
    const y = event.clientY;
    const container = this.getContainerByCoordinates(x, y);
    if (container) {
      this.clicksSubject$.next(container);
    }
  }

  private getContainerByCoordinates(x: number, y: number): PlayContainer | undefined {
    for (let i = 0; i < this.containerHTMLElements.length; i++) {
      const rect = this.containerHTMLElements[i].getBoundingClientRect();
      if (this.isInRect(x, y, rect)) {
        return this.playContainers[i];
      }
    }
    return undefined;
  }

  private isInRect(x: number, y: number, rect: DOMRect): boolean {
    return rect.x <= x && x <= rect.x + rect.width && rect.y <= y && y <= rect.y + rect.height;
  }

  private getContainerHTMLElemets() {
    this.containerHTMLElements = [];
    for (let containerIndex = 0; containerIndex < this.playContainers.length; containerIndex++) {
      const element = document.getElementById(Utils.getContainerId(containerIndex));
      if (element !== null) {
        this.containerHTMLElements.push(element);
      } else {
        console.error("Cannot find container HTMLelement.");
      }
    }
  }

  protected onMovingItemClick() {
    if (this.movingInProgress) {
      return;
    }
    if (this.selectedContainer) {
      this.clicksSubject$.next(this.selectedContainer);
    }
  }

  protected playClick() {
    this.gameService.createRandomGame(MAX_CONTAINER_COUNT - 2, MAX_CONTAINER_COUNT);
    this.containers = this.gameService.getContainers();
    this.prepareBoard();
  }

  protected createClick() {
    this.containers = this.playContainers.map(playContainer => {
      const gameContainer = new GameContainer(playContainer.index);
      gameContainer.colors = playContainer.items.filter(item => item.color !== undefined).map(item => item.color!);
      return gameContainer;
    });
    this.gameService.setContainers(this.containers);
    this.gameService.fromContainersToSetupContainers();
    this.mainService.setView("setup");
  }

}
