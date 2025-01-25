import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { concatMap, Observable, Subject, Subscription } from 'rxjs';
import { Item, itemCreate } from 'src/app/classes/model/item.class';
import { PlayContainer } from 'src/app/classes/model/play-container.class';
import { Step } from 'src/app/classes/solution-controller.class';
import { MainService } from 'src/app/services/main.service';
import { ContainerComponent } from '../container/container.component';
import { calculateMovingDuration, getItemIndex, getMovingPosition, getMovingTopCoordinate, getTopItemIndex } from 'src/app/classes/utils.class';

class PlayStep {
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

export class Position {
  top!: number;
  left!: number;

  constructor(top: number, left: number) {
    this.top = top;
    this.left = left;
  }
}

@Component({
  selector: 'app-board-solve',
  templateUrl: './board-solve.component.html',
  styleUrls: ['./board-solve.component.scss']
})
export class BoardSolveComponent implements OnInit, AfterViewInit, OnDestroy {

  playContainers: PlayContainer[] = [];
  private screenResizedSubscription: Subscription | undefined = undefined;

  private itemsElements: HTMLElement[] = [];
  private parentMovingElementRect: DOMRect;
  stepIndex: number = 0;
  completeStepIndex: number = 0;
  readonly minSpeed = 1;
  readonly maxSpeed = 20;
  readonly defaultSpeed = 5;
  speed: number = this.defaultSpeed;
  playing: boolean = false;
  stopping: boolean = false;

  private stepsSubject$ = new Subject<PlayStep>();
  movingItem: Item; // Item for moving animation

  constructor(public mainService: MainService) {
    this.createStepsSubject();
    this.movingItem = itemCreate(undefined, 0, true);
  }

  ngOnInit(): void {
    this.loadSpeed();
  }

  ngAfterViewInit(): void {
    this.playContainers = [...this.mainService.playContainers1, ...this.mainService.playContainers2];
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
  }

  private createStepsSubject() {
    this.stepsSubject$ = new Subject<PlayStep>();
    const stepsSubjectSubscription = this.stepsSubject$.pipe(
      concatMap(step => this.makeStep(step)))
      .subscribe({
        next: stepIndex => {
          this.completeStepIndex = stepIndex;
          if (this.playing && (this.completeStepIndex === 0 || this.completeStepIndex === this.mainService.solution!.steps.length)) {
            this.playing = false;
            this.stopping = false;
          }
        },
        error: () => {
          // Interrupted by button Stop
          stepsSubjectSubscription.unsubscribe();
          this.createStepsSubject();
          this.playing = false;
          this.stepIndex = this.completeStepIndex;
        }
      });
  }

  private loadSpeed() {
    let speed = Number(localStorage.getItem(MainService.STORAGE_KEY + "-speed"));
    if (speed < this.minSpeed || this.maxSpeed < speed) {
      speed = this.defaultSpeed;
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
    const step: Step = this.mainService.solution!.steps[this.stepIndex];
    this.stepIndex++;
    this.stepsSubject$.next(PlayStep.createPlayStep(this.stepIndex, step));
  }

  private makeStepBackward() {
    this.stepIndex--;
    const step: PlayStep = new PlayStep(this.stepIndex, this.mainService.solution!.steps[this.stepIndex].iTo, this.mainService.solution!.steps[this.stepIndex].iFrom);
    this.stepsSubject$.next(step);
  }

  private makeStep(step: PlayStep): Observable<number> {
    return new Observable<number>(observer => {
      if (this.stopping) {
        this.stopping = false;
        observer.error({ message: "Stop" });
        return;
      }
      // show moving item
      this.movingItem.color = this.playContainers[step.iFrom].peek();
      const indexFrom = getItemIndex(step.iFrom, this.playContainers[step.iFrom].size() - 1);
      const startPosition = getMovingPosition(this.itemsElements[indexFrom], this.parentMovingElementRect);
      this.setMovingPosition(startPosition);
      this.playContainers[step.iFrom].pop();
      this.movingItem.hidden = false;
      // moving
      setTimeout(async () => {
        const indexTo = getItemIndex(step.iTo, this.playContainers[step.iTo].size());
        const finishPosition = getMovingPosition(this.itemsElements[indexTo], this.parentMovingElementRect);
        const topPosition = new Position(this.getMovingTopCoordinate(step.iFrom), startPosition.left);
        const leftPosition = new Position(this.getMovingTopCoordinate(step.iTo), finishPosition.left);
        await this.moving(startPosition, topPosition);
        await this.moving(topPosition, leftPosition);
        await this.moving(leftPosition, finishPosition);
        this.playContainers[step.iTo].push(this.movingItem.color!);
        this.movingItem.hidden = true;
        this.completeStepIndex = step.index;
        await new Promise<void>(resolve => setTimeout(resolve, 0));
        observer.next(step.index);
        observer.complete();
      }, 0);
    });
  }

  private async moving(from: Position, to: Position): Promise<void> {
    return new Promise<void>(resolve => {
      const moving_duration1 = calculateMovingDuration(from, to, this.speed);
      this.movingItem.transitionDuration = (moving_duration1 / 1000) + "s";
      this.setMovingPosition(to);
      setTimeout(resolve, moving_duration1);
    });
  }

  private getMovingTopCoordinate(containerIndex: number): number {
    const index = getTopItemIndex(containerIndex);
    const itemElement = this.itemsElements[index];
    return getMovingTopCoordinate(itemElement, this.parentMovingElementRect);
  }

  private setMovingPosition(position: Position) {
    this.movingItem.top = `${position.top}px`;
    this.movingItem.left = `${position.left}px`;
  }

  backClick() {
    this.makeStepBackward();
  }

  nextClick() {
    this.makeStepForward();
  }

  playClick() {
    this.playing = true;
    while (this.stepIndex < this.mainService.solution!.steps.length) {
      this.makeStepForward();
    }
  }

  playBackClick() {
    this.playing = true;
    while (this.stepIndex > 0) {
      this.makeStepBackward();
    }
  }

  stopClick() {
    this.stopping = true;
  }

  setupClick() {
    this.mainService.setView("setup");
  }

}
