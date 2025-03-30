import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { concatMap, Observable, Subject, Subscription } from 'rxjs';
import { Color } from 'src/app/classes/model/colors.class';
import { MAX_CONTAINER_COUNT_IN_LINE } from 'src/app/classes/model/const.class';
import { GameContainer } from 'src/app/classes/model/game/game-container.class';
import { MovingController } from 'src/app/classes/moving-controller.class';
import { Step } from 'src/app/classes/solution-controller.class';
import { Utils } from 'src/app/classes/utils.class';
import { GameService } from 'src/app/services/game.service';
import { MainService, TGameView, TView } from 'src/app/services/main.service';

class PlayStep {
  index: number;
  iFrom: number;
  iTo: number;
  count: number;

  constructor(index: number, iFrom: number, iTo: number, count: number) {
    this.index = index;
    this.iFrom = iFrom;
    this.iTo = iTo;
    this.count = count;
  }

  static createPlayStep(index: number, step: Step) {
    return new PlayStep(index, step.iFrom, step.iTo, step.count);
  }
}

@Component({
  selector: 'app-board-solve',
  templateUrl: './board-solve.component.html',
  styleUrls: ['./board-solve.component.scss']
})
export class BoardSolveComponent implements AfterViewInit, OnDestroy {

  protected utils = Utils;
  protected readonly view: TGameView = 'solve';

  private playContainers: GameContainer[] = [];
  protected playContainers1: GameContainer[] = [];
  protected playContainers2: GameContainer[] = [];

  protected positionContainers1: GameContainer[] = [];
  protected positionContainers2: GameContainer[] = [];

  private screenResizedSubscription: Subscription | undefined = undefined;

  stepIndex: number = 0;
  completeStepIndex: number = 0;
  playing: boolean = false;
  stopping: boolean = false;

  private stepsSubject$ = new Subject<PlayStep>();

  protected movingController = new MovingController(this.mainService);

  constructor(public mainService: MainService, private gameService: GameService) {
    this.gameService.gameView = this.view;
    this.createStepsSubject();
    this.fillPlayContainers();
    this.createPositionContainers();
  }

  ngAfterViewInit(): void {
    this.playContainers = [...this.playContainers1, ...this.playContainers2];
    this.screenResizedSubscription = this.mainService.screenResized$.subscribe(() => {
      setTimeout(() => this.onScreenResized(), 500);
    });
    this.onScreenResized();
  }

  private onScreenResized() {
    this.movingController.getHTMLElements(this.playContainers.length);
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

  private makeStepForward() {
    const step: Step = this.mainService.solution!.steps[this.stepIndex];
    this.stepIndex++;
    this.stepsSubject$.next(PlayStep.createPlayStep(this.stepIndex, step));
  }

  private makeStepBackward() {
    this.stepIndex--;
    const step: PlayStep = new PlayStep(this.stepIndex, this.mainService.solution!.steps[this.stepIndex].iTo, this.mainService.solution!.steps[this.stepIndex].iFrom, 1);
    this.stepsSubject$.next(step);
  }

  private makeStep(step: PlayStep): Observable<number> {
    return new Observable<number>(observer => {
      if (this.stopping) {
        this.stopping = false;
        observer.error({ message: "Stop" });
        return;
      }
      this.movingController.moveFromTo(this.playContainers[step.iFrom], this.playContainers[step.iTo], step.count).subscribe(async () => {
        this.completeStepIndex = step.index;
        await new Promise<void>(resolve => setTimeout(resolve, 500));
        observer.next(step.index);
        observer.complete();
      });
    });
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

  private createPositionContainers() {
    this.positionContainers1 = this.playContainers1.map(container => Utils.createPositionContainer(container.index));
    this.positionContainers2 = this.playContainers2.map(container => Utils.createPositionContainer(container.index));
  }

}
