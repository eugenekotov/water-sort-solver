import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { concatMap, Observable, Subject, Subscription } from 'rxjs';
import { containerIsEmpty, containerIsFull, containerPeek, containerPop, containerPush, containersClone, PlayContainer } from 'src/app/classes/model/play-container.class';
import { MovingController } from 'src/app/classes/moving-controller.class';
import { getMovingTopCoordinate, getTopItemIndex } from 'src/app/classes/utils.class';
import { MainService } from 'src/app/services/main.service';
import { ContainerComponent } from '../container/container.component';


class PlayStepItem {
  constructor(public iFrom: number, public iTo: number) {}
}

class PlayStep {
  items: PlayStepItem[] = [];

  static create(iFrom: number, iTo: number): PlayStep {
    const result = new PlayStep();
    result.items.push(new PlayStepItem(iFrom, iTo));
    return result
  }
}

@Component({
  selector: 'app-board-play',
  templateUrl: './board-play.component.html',
  styleUrls: ['./board-play.component.scss']
})
export class BoardPlayComponent implements OnInit, AfterViewInit, OnDestroy {

  playContainers: PlayContainer[] = [];
  playContainers1: PlayContainer[] = [];
  playContainers2: PlayContainer[] = [];
  private screenResizedSubscription: Subscription | undefined = undefined;

  steps: PlayStep[] = [];

  private itemsElements: HTMLElement[] = [];
  private parentMovingElementRect: DOMRect;

  completeStepIndex: number = 0;

  readonly minSpeed = 1;
  readonly maxSpeed = 20;
  readonly defaultSpeed = 5;

  private clicksSubject$ = new Subject<PlayContainer>();
  private stopSubject$ = new Subject<void>();
  private stepsSubjectSubscription: Subscription;

  movingController = new MovingController();

  constructor(public mainService: MainService) {
    this.prepareBoard();
    this.movingController.speed = this.defaultSpeed;
  }

  ngOnInit(): void {
    this.loadSpeed();
  }

  ngAfterViewInit(): void {
    this.screenResizedSubscription = this.mainService.screenResized$.subscribe(() => {
      setTimeout(() => this.onScreenResized(), 500);
    });
    this.onScreenResized();
  }

  private onScreenResized() {
    this.getItemsElements();
    this.parentMovingElementRect = document.getElementById("moving")!.parentElement!.getBoundingClientRect();
  }

  ngOnDestroy(): void {
    if (this.screenResizedSubscription) {
      this.screenResizedSubscription.unsubscribe();
    }
    this.stepsSubjectSubscription.unsubscribe();
  }

  private createStepsSubject() {
    if (this.stepsSubjectSubscription) {
      this.stepsSubjectSubscription.unsubscribe();
    }
    this.clicksSubject$ = new Subject<PlayContainer>();
    this.stepsSubjectSubscription = this.clicksSubject$.pipe(
      concatMap(container => this.makeAction(container)))
      .subscribe({
        next: () => {
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

  private makeAction(container: PlayContainer): Observable<PlayContainer> {
    this.movingController.movingInProgress = true;
    return new Observable(observer => {
      const selectedContainer = this.getSelectedContainer();
      if (selectedContainer) {
        if (container.selected) {
          // Move colors back down
          this.movingController.moveDown(container, this.parentMovingElementRect, observer);
          container.selected = false;
        } else {
          if (container.isEmpty() || (!container.isFull() && container.peek() === this.movingController.getColor())) {
            // Move colors if it is possible
            // this.moveTo(container, observer);
            this.steps.push(PlayStep.create(selectedContainer.index, container.index));
          } else {
            this.movingController.moveDown(selectedContainer, this.parentMovingElementRect, observer);
          }
          selectedContainer.selected = false;
        }
      } else {
        if (this.movingController.stoppingInProgress) {
          observer.error({ message: "Stop" });
          return;
        }
        // No selected container
        if (!containerIsEmpty(container)) {
          // We selected container, move colors up
          this.movingController.moveUp(container, this.itemsElements, this.parentMovingElementRect, observer);
          container.selected = true;
        } else {
          observer.next();
          observer.complete();
        }
      }
    });
  }

  // private moveUp(container: PlayContainer, observer: Subscriber<PlayContainer>) {
  //   setTimeout(() => {
  //     const movingCount = containerGetTopColorCount(container);
  //     this.movingItem0.color = containerPeek(container);
  //     const index = getItemIndex(container.index, containerSize(container) - 1);
  //     const startPosition = getMovingPosition(this.itemsElements[index], this.parentMovingElementRect);
  //     this.setMovingPosition(startPosition);
  //     containerPop(container);
  //     this.movingItem.hidden = false;
  //     // moving
  //     setTimeout(async () => {
  //       const topPosition = new Position(this.getMovingTopCoordinate(container.index), startPosition.left);
  //       await this.moving(startPosition, topPosition);
  //       if (this.stoppingInProgress) {
  //         this.moveDown(container, observer);
  //         container.selected = false;
  //         return;
  //       }
  //       observer.next(container);
  //       observer.complete();
  //     }, 0);
  //   }, 0);
  // }

  // private moveDown(container: PlayContainer, observer: Subscriber<PlayContainer>) {
  //   // moving
  //   setTimeout(async () => {
  //     const index = getItemIndex(container.index, containerSize(container));
  //     const finishPosition = getMovingPosition(this.itemsElements[index], this.parentMovingElementRect);
  //     await this.moving(this.movingCurrentPosition, finishPosition);
  //     containerPush(container, this.movingItem.color!);
  //     this.movingItem.hidden = true;
  //     if (this.stoppingInProgress) {
  //       observer.error({ message: "Stop" });
  //       return;
  //     }
  //     observer.next(container);
  //     observer.complete();
  //   }, 0);
  // }

  // private moveTo(container: PlayContainer, observer: Subscriber<PlayContainer>) {
  //   setTimeout(async () => {
  //     const startPosition = this.movingCurrentPosition;
  //     const index = getItemIndex(container.index, containerSize(container));
  //     const finishPosition = getMovingPosition(this.itemsElements[index], this.parentMovingElementRect);
  //     const leftPosition = new Position(this.getMovingTopCoordinate(container.index), finishPosition.left);
  //     await this.moving(startPosition, leftPosition);
  //     await this.moving(leftPosition, finishPosition);
  //     containerPush(container, this.movingItem.color!);
  //     this.movingItem.hidden = true;
  //     if (this.stoppingInProgress) {
  //       observer.error({ message: "Stop" });
  //       return;
  //     }
  //     observer.next(container);
  //     observer.complete();
  //   }, 0);
  // }

  // private async moving(from: Position, to: Position): Promise<void> {
  //   return new Promise<void>(resolve => {
  //     const moving_duration1 = calculateMovingDuration(from, to, this.speed);
  //     this.movingItem.transitionDuration = (moving_duration1 / 1000) + "s";
  //     this.setMovingPosition(to);
  //     setTimeout(resolve, moving_duration1);
  //   });
  // }

  private getItemsElements() {
    this.itemsElements = [];
    for (let containerIndex = 0; containerIndex < this.playContainers.length; containerIndex++) {
      const container = this.playContainers[containerIndex];
      for (let itemIndex = 0; itemIndex < container.items.length; itemIndex++) {
        this.itemsElements.push(document.getElementById(ContainerComponent.getItemId(containerIndex, itemIndex))!);
      }
    }
  }

  getContainerId(index: number): string {
    return "container" + index;
  }

  speedChanged(event: any) {
    const speed = Number(event);
    this.saveSpeed(speed);
  }

  private loadSpeed() {
    let speed = Number(localStorage.getItem(MainService.STORAGE_KEY + "-speed"));
    if (speed < this.minSpeed || this.maxSpeed < speed) {
      speed = this.defaultSpeed;
    }
    this.movingController.speed = speed;
  }

  private saveSpeed(speed: number) {
    localStorage.setItem(MainService.STORAGE_KEY + "-speed", String(speed));
  }

  setupClick() {
    this.mainService.setMode("setup");
  }

  onContainerClick(container: PlayContainer) {
    this.clicksSubject$.next(container);
  }

  private static selectedContainerPredicate(container: PlayContainer): boolean {
    return container.selected;
  }

  private getSelectedContainer(): PlayContainer | undefined {
    return this.playContainers.find(BoardPlayComponent.selectedContainerPredicate);
  }

  private getMovingTopCoordinate(containerIndex: number): number {
    const index = getTopItemIndex(containerIndex);
    const itemElement = this.itemsElements[index];
    return getMovingTopCoordinate(itemElement, this.parentMovingElementRect);
  }

  // private setMovingPosition(position: Position) {
  //   this.movingCurrentPosition = position;
  //   this.movingItem.top = `${position.top}px`;
  //   this.movingItem.left = `${position.left}px`;
  // }

  backClick() {
    if (this.movingController.movingInProgress) {
      this.movingController.stoppingInProgress = true;
      const stopSubscriber = this.stopSubject$.subscribe(() => {
        stopSubscriber.unsubscribe();
        this.stepBack();
      });
    } else {
      this.stepBack();
    }
  }

  private stepBack() {
    const step = this.steps.pop();
    step!.items.forEach(item => containerPush(this.playContainers[item.iFrom], containerPop(this.playContainers[item.iTo])));
  }

  restartClick() {
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
    this.playContainers1 = containersClone(this.mainService.playContainers1);
    this.playContainers2 = containersClone(this.mainService.playContainers2);
    this.playContainers = [...this.playContainers1, ...this.playContainers2];
    this.steps = [];
    this.createStepsSubject();
    this.movingController.movingInProgress = false;
    this.movingController.stoppingInProgress = false;
    this.movingController.setHidden(true);
    setTimeout(() => this.getItemsElements(), 0);
  }

}
