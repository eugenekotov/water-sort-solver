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

  playContainers: PlayContainer[] = [];
  private screenChangedSubscription: Subscription | undefined = undefined;

  itemsElements: HTMLElement[] = [];
  stepIndex: number = 0;
  completeStepIndex: number = 0;
  readonly minSpeed = 1;
  readonly maxSpeed = 20;
  speed: number = this.minSpeed;
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
    this.loadSpeed();
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

  private loadSpeed() {
    let speed = Number(localStorage.getItem(MainService.STORAGE_KEY + "-speed"));
    if (speed < this.minSpeed) {
      speed = this.minSpeed;
    }
    if (this.maxSpeed < speed) {
      speed = this.maxSpeed;
    }
    this.speed = speed;
  }

  private saveSpeed(speed: number) {
    localStorage.setItem(MainService.STORAGE_KEY + "-speed", String(speed));
  }

  speedChanged(event: any) {
    const speed = Number(event);
    this.saveSpeed(speed);
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
      // show moving item
      this.mainService.movingItem.color = this.playContainers[step.iFrom].peek();
      const startPosition = this.getMovingPosition(step.iFrom, this.playContainers[step.iFrom].size() - 1);
      this.setMovingPosition(startPosition);
      this.playContainers[step.iFrom].pop();
      this.mainService.movingItem.hidden = false;
      // moving
      setTimeout(async () => {
        const finishPosition = this.getMovingPosition(step.iTo, this.playContainers[step.iTo].size());
        const topPosition = new Position(this.getMovingTopPosition(step.iFrom), startPosition.left);
        const leftPosition = new Position(this.getMovingTopPosition(step.iTo), finishPosition.left);
        await this.moving(startPosition, topPosition);
        await this.moving(topPosition, leftPosition);
        await this.moving(leftPosition, finishPosition);
        this.playContainers[step.iTo].push(this.mainService.movingItem.color!);
        this.mainService.movingItem.hidden = true;
        this.completeStepIndex = step.index;
        await new Promise<void>(resolve => setTimeout(resolve, 100/this.speed));
        observer.next(step.index);
        observer.complete();
      }, 0);
    });
  }

  private async moving(from: Position, to: Position): Promise<void> {
    return new Promise<void>(resolve => {
      const moving_duration1 = this.calculateMovingDuration(from, to);
      this.mainService.movingItem.transitionDuration = (moving_duration1 / 1000) + "s";
      this.setMovingPosition(to);
      setTimeout(resolve, moving_duration1);
    });
  }

  // TODO: Move faster when you are close to finish
  private calculateMovingDuration(from: Position, to: Position): number {
    const way = Math.sqrt(Math.pow(to.top - from.top, 2) + Math.pow(to.left - from.left, 2));
    return (1000 + way * 15) / this.speed;
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
    }, 2000); // TODO: Fix it
  }

  setupClick() {
    this.mainService.setMode("setup");
  }

}
