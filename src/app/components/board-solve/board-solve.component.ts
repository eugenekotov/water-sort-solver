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

    protected solveContainers1: GameContainer[] = [];
    protected solveContainers2: GameContainer[] = [];

    protected positionContainers1: GameContainer[] = [];
    protected positionContainers2: GameContainer[] = [];

    private screenResizedSubscription: Subscription | undefined = undefined;

    protected stepIndex: number = 0;
    playing: boolean = false;
    stopping: boolean = false;

    private stepsSubject$ = new Subject<PlayStep>();

    protected movingController = new MovingController(this.mainService);

    constructor(protected mainService: MainService, protected gameService: GameService) {
        this.gameService.gameView = this.view;
        this.createStepsSubject();
        this.createSolveContainers();
        this.createPositionContainers();
        this.stepIndex = this.gameService.completeStepIndex;
    }

    ngAfterViewInit(): void {
        this.screenResizedSubscription = this.mainService.screenResized$.subscribe(() => {
            setTimeout(() => this.onScreenResized(), 500);
        });
        this.onScreenResized();
    }

    private onScreenResized() {
        this.movingController.getHTMLElements(this.gameService.solveContainers.length);
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
                    this.gameService.completeStepIndex = stepIndex;
                    if (this.playing && (this.gameService.completeStepIndex === 0 || this.gameService.completeStepIndex === this.gameService.solution!.steps.length)) {
                        this.playing = false;
                        this.stopping = false;
                    }
                },
                error: () => {
                    // Interrupted by button Stop
                    stepsSubjectSubscription.unsubscribe();
                    this.createStepsSubject();
                    this.playing = false;
                    this.stepIndex = this.gameService.completeStepIndex;
                }
            });
    }

    private makeStepForward() {
        const step: Step = this.gameService.solution!.steps[this.stepIndex];
        this.stepIndex++;
        this.stepsSubject$.next(PlayStep.createPlayStep(this.stepIndex, step));
    }

    private makeStepBackward() {
        this.stepIndex--;
        const step: PlayStep = new PlayStep(this.stepIndex, this.gameService.solution!.steps[this.stepIndex].iTo, this.gameService.solution!.steps[this.stepIndex].iFrom, this.gameService.solution!.steps[this.stepIndex].count);
        this.stepsSubject$.next(step);
    }

    private makeStep(step: PlayStep): Observable<number> {
        return new Observable<number>(observer => {
            if (this.stopping) {
                this.stopping = false;
                observer.error({ message: "Stop" });
                return;
            }
            this.movingController.moveFromTo(this.gameService.solveContainers[step.iFrom], this.gameService.solveContainers[step.iTo], step.count).subscribe(async () => {
                this.gameService.completeStepIndex = step.index;
                await new Promise<void>(resolve => setTimeout(resolve, this.movingController.DELAY_BETWEEN_STEPS));
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
        while (this.stepIndex < this.gameService.solution!.steps.length) {
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

    private createSolveContainers() {
        const containerCount = this.gameService.solveContainers.length;
        let container1Count = containerCount;
        if (containerCount > MAX_CONTAINER_COUNT_IN_LINE) {
            container1Count = Math.ceil(containerCount / 2);
        }
        this.solveContainers1 = this.gameService.solveContainers.slice(0, container1Count);
        this.solveContainers2 = this.gameService.solveContainers.slice(container1Count, containerCount);
    }

    private createPositionContainers() {
        this.positionContainers1 = this.solveContainers1.map(container => Utils.createPositionContainer(container.index));
        this.positionContainers2 = this.solveContainers2.map(container => Utils.createPositionContainer(container.index));
    }

    protected saveClick() {
        this.mainService.saveState();
    }

    protected loadClick() {
        this.mainService.setView('load');
    }

}
