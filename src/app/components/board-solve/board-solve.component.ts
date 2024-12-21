import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { concatMap, Observable, ReplaySubject, Subject, Subscription, takeUntil } from 'rxjs';
import { PlayContainer } from 'src/app/classes/model/play-container.class';
import { Step } from 'src/app/classes/solution.class';
import { MainService } from 'src/app/services/main.service';
import { ContainerComponent } from '../container/container.component';

export class PlayStep {
  index: number;
  iFrom: number;
  iTo: number;

  constructor(index: number, iFrom: number, iTo: number) {
    this.index = index;
    this.iFrom = iFrom;
    this.iTo = iTo;
  }

  static createPlayStep(index: number, step: Step) {
    return new PlayStep(index, step.iFrom, step.iTo);
  }
}

class Position {
  top!: number;
  left!: number;

  constructor(top: number, left: number) {
    this.top = top;
    this.left = left;
  }
}

// TODO: Add faster-slower functionality
@Component({
  selector: 'app-board-solve',
  templateUrl: './board-solve.component.html',
  styleUrls: ['./board-solve.component.scss']
})
export class BoardSolveComponent implements OnInit, AfterViewInit, OnDestroy {

  // static readonly MOVING_TOP = -50;
  // TODO: Revert speed
  // static readonly MOVING_TOP_DURATION = 400;
  static readonly MOVING_TOP_DURATION = 800;

  playContainers: PlayContainer[] = [];
  private screenChangedSubscription: Subscription | undefined = undefined;

  itemsElements: HTMLElement[] = [];
  stepIndex: number = 0;
  completeStepIndex: number = 0;
  playing: boolean = false;
  stopping: boolean = false;

  private stepsSubject$ = new Subject<PlayStep>();
  private stopPlaying$ = new ReplaySubject<void>(1);

  constructor(public mainService: MainService) { }

  ngOnInit(): void {
    this.stepsSubject$.pipe(
      concatMap(step => this.makeStep(step).pipe(takeUntil(this.stopPlaying$))))
      .subscribe({
        next: stepIndex => {
          this.completeStepIndex = stepIndex;
          if (this.playing && (this.completeStepIndex === 0 || this.completeStepIndex === this.mainService.solution.steps.length)) {
            this.playing = false;
          }
        },
        error: error => {
          console.log(error);
        },
        complete: () => {
          console.log("Complete");
        }
      });
  }

  ngAfterViewInit(): void {
    this.playContainers = [...this.mainService.playContainers1, ...this.mainService.playContainers2];
    this.screenChangedSubscription = this.mainService.screenChanged$.subscribe(() => {
      setTimeout(() => this.getItemsElements(), 500);
    });
    this.getItemsElements();
  }

  ngOnDestroy(): void {
    if (this.screenChangedSubscription) {
      this.screenChangedSubscription.unsubscribe();
    }
  }

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

  private makeStepForward() {
    const step: Step = this.mainService.solution.steps[this.stepIndex];
    this.stepIndex++;
    this.stepsSubject$.next(PlayStep.createPlayStep(this.stepIndex, step));
  }

  private makeStepBackward() {
    this.stepIndex--;
    const step: PlayStep = new PlayStep(this.stepIndex, this.mainService.solution.steps[this.stepIndex].iTo, this.mainService.solution.steps[this.stepIndex].iFrom);
    this.stepsSubject$.next(step);
  }

  private makeStep(step: PlayStep): Observable<number> {
    return new Observable<number>(observer => {
      const color = this.playContainers[step.iFrom].peek();
      this.mainService.movingItem.color = color;
      // show moving item
      const itemIndex = this.playContainers[step.iFrom].size() - 1;
      const startPosition = this.getMovingPosition(step.iFrom, itemIndex);
      this.setMovingPosition(startPosition);
      this.playContainers[step.iFrom].pop();
      this.mainService.movingItem.hidden = false;
      const movig_duration = this.calculateMovingDuration(step.iFrom, step.iTo);
      setTimeout(() => {
        this.moveItem(startPosition, step.iFrom, step.iTo, movig_duration).then(_ => {
          this.playContainers[step.iTo].push(color);
          this.mainService.movingItem.hidden = true;
          this.completeStepIndex = step.index;
          setTimeout(() => {
            observer.next(step.index);
            observer.complete();
          }, 100);
        });
      }, 0);
    });
  }

  // TODO: Change speed in options
  // TODO: Move faster when you are close to finish
  private calculateMovingDuration(iFrom: number, iTo: number): number {
    const way = Math.abs(iFrom - iTo);
    // TODO: back speed
    // return 400 + way * 50;
    return 600 + way * 100;
  }

  private getMovingPosition(containerIndex: number, itemIndex: number): Position {
    const index = containerIndex * PlayContainer.MAX_SIZE + itemIndex;
    const itemElement = this.itemsElements[index];
    const movingElement = document.getElementById("moving");
    const itemRect = itemElement!.getBoundingClientRect();
    const parentMovingElement = movingElement!.parentElement!.getBoundingClientRect();
    const top = itemRect.top - parentMovingElement.top;
    const left = itemRect.left - parentMovingElement.left;
    return new Position(top, left);
  }

  private getMovingTopPosition(containerIndex: number): number {
    const index = containerIndex * PlayContainer.MAX_SIZE + PlayContainer.MAX_SIZE - 1;
    const itemElement = this.itemsElements[index];
    const movingElement = document.getElementById("moving");
    const itemRect = itemElement!.getBoundingClientRect();
    const parentMovingElement = movingElement!.parentElement!.getBoundingClientRect();
    const top = itemRect.top - parentMovingElement.top - itemRect.height * 2;
    return top;
  }


  private setMovingPosition(position: Position) {
    this.mainService.movingItem.top = `${position.top}px`;
    this.mainService.movingItem.left = `${position.left}px`;
  }

  private moveItem(startPosition: Position, iFrom: number, iTo: number, moving_duration: number): Promise<void> {
    return new Promise(resolve => {
      const itemIndex = this.playContainers[iTo].size();
      const finishPosition = this.getMovingPosition(iTo, itemIndex);
      // TODO: Calculate BoardSolveComponent.MOVING_TOP
      const topStartCoord = this.getMovingTopPosition(iFrom);
      const topLeftCoord = this.getMovingTopPosition(iTo);
      const topPosition = new Position(topStartCoord, startPosition.left);
      const leftPosition = new Position(topLeftCoord, finishPosition.left);
      // Move top
      this.mainService.movingItem.transitionDuration = "" + (BoardSolveComponent.MOVING_TOP_DURATION / 1000) + "s";
      this.setMovingPosition(topPosition);
      setTimeout(() => {
        // Move left
        this.mainService.movingItem.transitionDuration = "" + (moving_duration / 1000) + "s";
        this.setMovingPosition(leftPosition);
        setTimeout(() => {
          // Move down
          this.mainService.movingItem.transitionDuration = "" + (BoardSolveComponent.MOVING_TOP_DURATION / 1000) + "s";
          this.setMovingPosition(finishPosition);
          setTimeout(() => {
            resolve();
          }, BoardSolveComponent.MOVING_TOP_DURATION);

        }, moving_duration);
      }, BoardSolveComponent.MOVING_TOP_DURATION);
    });
  }

  backClick() {
    this.stopPlaying$ = new ReplaySubject<void>(1);
    this.makeStepBackward();
  }

  nextClick() {
    this.stopPlaying$ = new ReplaySubject<void>(1);
    this.makeStepForward();
  }

  playClick() {
    this.stopPlaying$ = new ReplaySubject<void>(1);
    this.playing = true;
    while (this.stepIndex < this.mainService.solution.steps.length) {
      this.makeStepForward();
    }
  }

  playBackClick() {
    this.stopPlaying$ = new ReplaySubject<void>(1);
    this.playing = true;
    while (this.stepIndex > 0) {
      this.makeStepBackward();
    }
  }

  stopClick() {
    this.stopping = true;
    this.stopPlaying$.next();
    setTimeout(() => {
      this.playing = false;
      this.stopping = false;
      console.log("Set this.stepIndex = " + this.completeStepIndex);
      this.stepIndex = this.completeStepIndex;
    }, 2000);
  }

  setupClick() {
    this.mainService.setMode("setup");
  }

}
