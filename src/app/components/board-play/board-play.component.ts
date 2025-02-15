import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { concatMap, Observable, Subject, Subscription } from 'rxjs';
import { MAX_CONTAINER_COUNT, MAX_CONTAINER_COUNT_IN_LINE } from 'src/app/classes/model/const.class';
import { Game } from 'src/app/classes/model/game/game.class';
import { PlayContainer } from 'src/app/classes/model/play-container.class';
import { MovingController } from 'src/app/classes/moving-controller.class';
import { MainService } from 'src/app/services/main.service';


export class PlayStep {
  constructor(public iFrom: number, public iTo: number, public count: number) { }
}

@Component({
  selector: 'app-board-play',
  templateUrl: './board-play.component.html',
  styleUrls: ['./board-play.component.scss']
})
export class BoardPlayComponent implements AfterViewInit, OnDestroy {

  private game: Game;
  private playContainers: PlayContainer[] = [];
  protected playContainers1: PlayContainer[] = [];
  protected playContainers2: PlayContainer[] = [];
  private selectedContainer: PlayContainer | undefined;

  private screenResizedSubscription: Subscription | undefined = undefined;
  private containerHTMLElements: any[] = [];

  protected steps: PlayStep[] = [];

  protected completeStepIndex: number = 0;

  private clicksSubject$ = new Subject<PlayContainer>();
  private stopSubject$ = new Subject<void>();
  private stepsSubjectSubscription: Subscription;

  protected movingController = new MovingController(this.mainService);
  protected movingInProgress: boolean = false;

  constructor(public mainService: MainService) {
    if (this.mainService.game) {
      this.game = this.mainService.game;
    } else {
      this.game = Game.createRandomGame(MAX_CONTAINER_COUNT - 2, MAX_CONTAINER_COUNT);
    }
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
      concatMap(container => this.makeAction(container)))
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

  private makeAction(container: PlayContainer): Observable<PlayStep | undefined> {
    return new Observable(observer => {
      this.movingInProgress = true;
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

  protected getContainerId(index: number): string {
    return "container" + index;
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
    const containerCount = this.game.containers.length;
    let container1Count = containerCount;
    if (containerCount > MAX_CONTAINER_COUNT_IN_LINE) {
      container1Count = Math.ceil(containerCount / 2);
    }
    this.game.containers.forEach((container, index) => {
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
    const container = this.getContainer(x, y);
    if (container) {
      this.clicksSubject$.next(container);
    }
  }

  private getContainer(x: number, y: number): PlayContainer | undefined {
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
      this.containerHTMLElements.push(document.getElementById(this.getContainerId(containerIndex)));
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
    this.mainService.game!.clear();
    this.mainService.game!.fillRandom();
    this.prepareBoard();
  }

}
