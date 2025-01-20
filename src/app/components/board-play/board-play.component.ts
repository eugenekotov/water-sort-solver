import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { concatMap, Observable, Subject, Subscription } from 'rxjs';
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
export class BoardPlayComponent implements OnInit, AfterViewInit, OnDestroy {

  playContainers: PlayContainer[] = [];
  playContainers1: PlayContainer[] = [];
  playContainers2: PlayContainer[] = [];
  private screenResizedSubscription: Subscription | undefined = undefined;
  private containerHTMLElements: any[] = [];

  steps: PlayStep[] = [];

  completeStepIndex: number = 0;

  readonly minSpeed = 1;
  readonly maxSpeed = 20;
  readonly defaultSpeed = 5;

  private clicksSubject$ = new Subject<PlayContainer>();
  private stopSubject$ = new Subject<void>();
  private stepsSubjectSubscription: Subscription;

  movingController = new MovingController();
  movingInProgress: boolean = false;

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
    this.movingController.getHTMLElements(this.playContainers);
    this.getContainerHTMLElemets();
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
      const selectedContainer = this.getSelectedContainer();
      if (selectedContainer) {
        if (container.selected) {
          // Move colors back down
          this.movingController.moveDown(container, observer);
          container.selected = false;
        } else {
          if (container.isEmpty() || (!container.isFull() && container.peek() === this.movingController.getColor())) {
            // Move colors if it is possible
            this.movingController.moveTo(selectedContainer, container, observer);
          } else {
            this.movingController.moveDown(selectedContainer, observer);
          }
          selectedContainer.selected = false;
        }
      } else {
        if (this.movingController.stoppingInProgress) {
          observer.error({ message: "Stop" });
          return;
        }
        // No selected container
        if (!PlayContainer.isEmpty(container)) {
          // We selected container, move colors up
          this.movingController.moveUp(container, observer);
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
  //     this.movingItem0.color = container.peek();
  //     const index = getItemIndex(container.index, PlayContainer.size(container) - 1);
  //     const startPosition = getMovingPosition(this.itemsElements[index], this.parentMovingElementRect);
  //     this.setMovingPosition(startPosition);
  //     container.pop();
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
  //     const index = getItemIndex(container.index, PlayContainer.size(container));
  //     const finishPosition = getMovingPosition(this.itemsElements[index], this.parentMovingElementRect);
  //     await this.moving(this.movingCurrentPosition, finishPosition);
  //     PlayContainer.push(container, this.movingItem.color!);
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
  //     const index = getItemIndex(container.index, PlayContainer.size(container));
  //     const finishPosition = getMovingPosition(this.itemsElements[index], this.parentMovingElementRect);
  //     const leftPosition = new Position(this.getMovingTopCoordinate(container.index), finishPosition.left);
  //     await this.moving(startPosition, leftPosition);
  //     await this.moving(leftPosition, finishPosition);
  //     PlayContainer.push(container, this.movingItem.color!);
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

  onContainerClick(event: any, container: PlayContainer) {
    this.clicksSubject$.next(container);
    event.stopPropagation();
  }

  private static selectedContainerPredicate(container: PlayContainer): boolean {
    return container.selected;
  }

  private getSelectedContainer(): PlayContainer | undefined {
    return this.playContainers.find(BoardPlayComponent.selectedContainerPredicate);
  }

  // private getMovingTopCoordinate(containerIndex: number): number {
  //   const index = getTopItemIndex(containerIndex);
  //   const itemElement = this.itemsElements[index];
  //   return getMovingTopCoordinate(itemElement, this.parentMovingElementRect);
  // }

  // private setMovingPosition(position: Position) {
  //   this.movingCurrentPosition = position;
  //   this.movingItem.top = `${position.top}px`;
  //   this.movingItem.left = `${position.left}px`;
  // }

  backClick() {
    if (this.movingInProgress) {
      this.movingController.stoppingInProgress = true;
      const stopSubscriber = this.stopSubject$.subscribe(() => {
        stopSubscriber.unsubscribe();
        this.stepBack();
      });
    } else {
      const selectedContainer = this.getSelectedContainer();
      if (selectedContainer) {
        new Observable(observer => {
          this.movingController.moveDown(selectedContainer, observer);
        }).subscribe(() => this.stepBack());
      } else {
        this.stepBack();
      }
    }
  }

  private stepBack() {
    const step = this.steps.pop();
    for (let i = 0; i < step!.count; i++) {
      PlayContainer.push(this.playContainers[step!.iFrom], this.playContainers[step!.iTo].pop())
    }
  }

  restartClick() {
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
    this.playContainers1 = PlayContainer.containersClone(this.mainService.playContainers1);
    this.playContainers2 = PlayContainer.containersClone(this.mainService.playContainers2);
    this.playContainers = [...this.playContainers1, ...this.playContainers2];
    this.steps = [];
    this.createStepsSubject();
    this.movingInProgress = false;
    this.movingController.stoppingInProgress = false;
    this.movingController.setHidden(this.movingController.movingItems, true);
    setTimeout(() => this.onScreenResized(), 0);
  }

  onClick(event: any) {
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

}
