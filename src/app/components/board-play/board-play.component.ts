import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { concatMap, Observable, Subject, Subscription } from 'rxjs';
import { Color } from 'src/app/classes/model/colors.class';
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

  private originalContainers: GameContainer[];

  private playContainers: GameContainer[] = [];
  protected playContainers1: GameContainer[] = [];
  protected playContainers2: GameContainer[] = [];
  private selectedContainer: GameContainer | undefined;

  protected containersPositions1: GameContainer[] = [];
  protected containersPositions2: GameContainer[] = [];

  private screenResizedSubscription: Subscription | undefined = undefined;
  private containerHTMLElements: any[] = []; // To get container by coordinates

  protected steps: PlayStep[] = [];

  protected completeStepIndex: number = 0;

  private clicksSubject$ = new Subject<GameContainer>();
  private stopSubject$ = new Subject<void>();
  private stepsSubjectSubscription: Subscription;

  protected movingController = new MovingController(this.mainService);

  constructor(public mainService: MainService, public gameService: GameService) {
    if (!this.gameService.hasGame()) {
      this.gameService.createRandomGame(MAX_CONTAINER_COUNT - 2, MAX_CONTAINER_COUNT);
    }
    this.originalContainers = this.gameService.getContainers();
    this.prepareBoard();
    this.createContainerPositions();
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
    this.movingController.getHTMLElements2(this.playContainers.length);
    this.getContainerHTMLElemets();
  }

  private createStepsSubject() {
    if (this.stepsSubjectSubscription) {
      this.stepsSubjectSubscription.unsubscribe();
    }
    this.clicksSubject$ = new Subject<GameContainer>();
    this.stepsSubjectSubscription = this.clicksSubject$.pipe(
      concatMap(container => this.handleClick(container)))
      .subscribe({
        next: (step: PlayStep | undefined) => {
          if (step) {
            this.steps.push(step);
          }
          this.movingController.movingInProgress = false;
          // TODO: Here we need check is container or board resolved
        },
        error: () => {
          // Interrupted by button start from scratch or step back
          this.movingController.stoppingInProgress = false;
          this.movingController.movingInProgress = false;
          this.stepsSubjectSubscription.unsubscribe();
          this.createStepsSubject();
          this.stopSubject$.next();
        }
      });
  }

  private createContainerPositions() {
    this.containersPositions1 = this.playContainers1.map(container => this.createContainerPosition(container));
    this.containersPositions2 = this.playContainers2.map(container => this.createContainerPosition(container));
  }

  private createContainerPosition(container: GameContainer): GameContainer {
    const result = new GameContainer(container.index);
    result.colors = Array<Color>(CONTAINER_SIZE).fill(Color.RED);
    return result;
  }


  private handleClick(container: GameContainer): Observable<PlayStep | undefined> {
    return new Observable(observer => {
      this.movingController.movingInProgress = true;
      if (this.selectedContainer) {
        if (container.index === this.selectedContainer.index) {
          // Move colors back down
          this.movingController.moveDown(container, observer);
          this.selectedContainer = undefined;
        } else {
          if (container.isEmpty() || (!container.isFull() && container.peek() === this.movingController.getColor())) {
            // Move colors if it is possible
            this.movingController.moveTo(this.selectedContainer, container, observer);
          } else {
            this.movingController.moveDown(this.selectedContainer, observer);
          }
          this.selectedContainer = undefined;
        }
      } else {
        if (this.movingController.stoppingInProgress) {
          observer.error({ message: "Stop" });
          return;
        }
        // No selected container
        if (!container.isEmpty()) {
          // We selected container, move colors up
          this.movingController.moveUp(container, observer);
          this.selectedContainer = container;
        } else {
          observer.next();
          observer.complete();
        }
      }
    });
  }

  protected onContainerClick(event: any, container: GameContainer) {
    this.clicksSubject$.next(container);
    event.stopPropagation();
  }

  protected backClick() {
    if (this.movingController.movingInProgress) {
      this.movingController.stoppingInProgress = true;
      const stopSubscriber = this.stopSubject$.subscribe(() => {
        stopSubscriber.unsubscribe();
        this.stepBack();
      });
    } else {
      if (this.selectedContainer) {
        new Observable(observer => {
          this.movingController.moveDown(this.selectedContainer!, observer);
        }).subscribe(() => this.stepBack());
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
    if (this.movingController.movingInProgress) {
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
    const containerCount = this.originalContainers.length;
    let container1Count = containerCount;
    if (containerCount > MAX_CONTAINER_COUNT_IN_LINE) {
      container1Count = Math.ceil(containerCount / 2);
    }
    this.originalContainers.forEach((container, index) => {
      const playCountainer: GameContainer = GameContainer.clone(container);
      if (index < container1Count) {
        this.playContainers1.push(playCountainer);
      } else {
        this.playContainers2.push(playCountainer);
      }
    });
    this.playContainers = [...this.playContainers1, ...this.playContainers2];
    this.steps = [];
    this.createStepsSubject();
    this.movingController.movingInProgress = false;
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

  private getContainerByCoordinates(x: number, y: number): GameContainer | undefined {
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
      this.containerHTMLElements.push(document.getElementById(Utils.getContainerId(containerIndex)));
    }
  }

  protected onMovingItemClick() {
    if (this.movingController.movingInProgress) {
      return;
    }
    if (this.selectedContainer) {
      this.clicksSubject$.next(this.selectedContainer);
    }
  }

  protected playClick() {
    this.gameService.createRandomGame(MAX_CONTAINER_COUNT - 2, MAX_CONTAINER_COUNT);
    this.originalContainers = this.gameService.getContainers();
    this.prepareBoard();
  }

  protected createClick() {
    this.gameService.setContainers(this.playContainers);
    this.gameService.fromContainersToSetupContainers();
    this.mainService.setView("setup");
  }

}
