import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { concatMap, Observable, Subject, Subscription } from 'rxjs';
import { Color } from 'src/app/classes/model/colors.class';
import { MAX_CONTAINER_COUNT_IN_LINE } from 'src/app/classes/model/const.class';
import { GameContainer } from 'src/app/classes/model/game/game-container.class';
import { MovingItem, Position } from 'src/app/classes/model/item.class';
import { MovingController } from 'src/app/classes/moving-controller.class';
import { Step } from 'src/app/classes/solution-controller.class';
import { getItemIndex, getMovingPosition, getMovingTopCoordinate, getTopItemIndex, Utils } from 'src/app/classes/utils.class';
import { GameService } from 'src/app/services/game.service';
import { MainService, TView } from 'src/app/services/main.service';

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

@Component({
  selector: 'app-board-solve',
  templateUrl: './board-solve.component.html',
  styleUrls: ['./board-solve.component.scss']
})
export class BoardSolveComponent implements AfterViewInit, OnDestroy {

  protected utils = Utils;
  protected readonly view: TView = 'solve';

  playContainers: GameContainer[] = [];

  playContainers1: GameContainer[] = [];
  playContainers2: GameContainer[] = [];

  protected containersPositions1: GameContainer[] = [];
  protected containersPositions2: GameContainer[] = [];

  private screenResizedSubscription: Subscription | undefined = undefined;

  private itemsElements: HTMLElement[] = [];
  private parentMovingElementRect: DOMRect;
  stepIndex: number = 0;
  completeStepIndex: number = 0;
  playing: boolean = false;
  stopping: boolean = false;

  private stepsSubject$ = new Subject<PlayStep>();

  protected movingController = new MovingController(this.mainService);
  protected movingInProgress: boolean = false;
  movingItem: MovingItem = new MovingItem(); // Item for moving animation

  constructor(public mainService: MainService, private gameService: GameService) {
    // TODO: temporary
    const containersString = localStorage.getItem("temp-sorter-containersString");
    this.gameService.setContainers(JSON.parse(containersString!));
    const solution = localStorage.getItem("temp-sorter-solution");
    this.mainService.solution = JSON.parse(solution!);
    //
    this.createStepsSubject();
    this.fillPlayContainers();
    this.createSetupContainerPositions();
  }

  ngAfterViewInit(): void {
    this.playContainers = [...this.playContainers1, ...this.playContainers2];
    this.screenResizedSubscription = this.mainService.screenResized$.subscribe(() => {
      setTimeout(() => this.onScreenResized(), 500);
    });
    this.onScreenResized();
  }

  private onScreenResized() {
    this.movingController.getHTMLElements2(this.playContainers);
    this.getItemsElements();
    this.parentMovingElementRect = document.getElementById("moving")!.parentElement!.parentElement!.getBoundingClientRect();
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

  private getItemsElements() {
    this.itemsElements = [];
    for (let containerIndex = 0; containerIndex < this.playContainers.length; containerIndex++) {
      const container = this.playContainers[containerIndex];
      for (let itemIndex = 0; itemIndex < container.colors.length; itemIndex++) {
        this.itemsElements.push(document.getElementById(Utils.getContainerItemId(containerIndex, itemIndex))!);
      }
    }
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


      // TODO: Use moving controller

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
      const moving_duration1 = MovingController.calculateMovingDuration(from, to, this.mainService.speed);
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
    // TODO: temporary
    // const containersString = JSON.stringify(this.gameService.getContainers());
    // localStorage.setItem("temp-sorter-containersString", containersString);
    // const solution = JSON.stringify(this.mainService.solution);
    // localStorage.setItem("temp-sorter-solution", solution);
    //
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

  private fillPlayContainers() {
    this.playContainers1 = this.gameService.getContainers();
    this.playContainers2 = [];
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

  private createSetupContainerPositions() {
    this.containersPositions1 = this.playContainers1.map(container => this.createSetupContainerPosition(container));
    this.containersPositions2 = this.playContainers2.map(container => this.createSetupContainerPosition(container));
  }

  private createSetupContainerPosition(container: GameContainer): GameContainer {
    const result = new GameContainer(container.index);
    result.push(Color.RED);
    result.push(Color.RED);
    result.push(Color.RED);
    result.push(Color.RED);
    return result;
  }

  // TODO: It has duplicates
  protected getItemStyle(color: Color) {
    return { 'background-color': color };
  }

}
