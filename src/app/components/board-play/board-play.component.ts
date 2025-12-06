import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { concatMap, Observable, Subject, Subscriber, Subscription } from 'rxjs';
import { GameController } from 'src/app/classes/controller/game-controller.class';
import { CONTAINER_SIZE, MAX_CONTAINER_COUNT, MAX_CONTAINER_COUNT_IN_LINE } from 'src/app/classes/model/const.class';
import { GameContainer } from 'src/app/classes/model/game/game-container.class';
import { MovingController } from 'src/app/classes/moving-controller.class';
import { Utils } from 'src/app/classes/utils.class';
import { GameService } from 'src/app/services/game.service';
import { MainService, TGameView } from 'src/app/services/main.service';
import { StatisticsService } from 'src/app/services/statistics.service';
import { PlayedDialogComponent, PlayedDialogData, PlayedDialogResult } from '../played-dialog/played-dialog.component';


export class PlayStep {
    constructor(public iFrom: number, public iTo: number, public count: number) { }
}

interface HandleClickError {
    message: string;
    shouldStepBack: boolean;
}

@Component({
    selector: 'app-board-play',
    templateUrl: './board-play.component.html',
    styleUrls: ['./board-play.component.scss']
})
export class BoardPlayComponent implements AfterViewInit, OnDestroy {

    protected readonly Utils = Utils;
    protected readonly view: TGameView = 'play';

    protected playContainers1: GameContainer[] = [];
    protected playContainers2: GameContainer[] = [];

    protected positionContainers1: GameContainer[] = [];
    protected positionContainers2: GameContainer[] = [];

    private selectedContainer: GameContainer | undefined;

    private screenResizedSubscription: Subscription | undefined = undefined;
    private containerHTMLElements: HTMLElement[] = []; // To get container by coordinates // TODO: Check it

    private clicksSubject$ = new Subject<GameContainer>();
    private stopMovingSubject$ = new Subject<boolean>(); // allow to subscribe to stopped event, result says should be reverted latest step
    private stepsSubjectSubscription: Subscription;

    protected movingController = new MovingController(this.mainService);
    protected movingInProgress: boolean = false;
    protected stoppingInProgress: boolean = false;

    protected previousStepCount: number = 0;

    protected activeContainerIndex: number | undefined;
    protected activeContainerBackgroundColor: string;

    constructor(public mainService: MainService, public gameService: GameService, public dialog: MatDialog, private statisticsService: StatisticsService) {
        this.gameService.gameView = this.view;
        this.prepareBoard();
        this.createPositionContainers();
        this.setActiveContainerBackgroundColor();
    }

    ngAfterViewInit(): void {
        this.screenResizedSubscription = this.mainService.screenResized$.subscribe(() => {
            setTimeout(() => this.onScreenResized(), 500);
        });
        this.onScreenResized();
        setTimeout(() => this.checkGameFinished());
    }

    ngOnDestroy(): void {
        if (this.screenResizedSubscription) {
            this.screenResizedSubscription.unsubscribe();
        }
        this.stepsSubjectSubscription.unsubscribe();

    }

    private setActiveContainerBackgroundColor() {
        if (this.mainService.theme === 'dark-theme') {
            this.activeContainerBackgroundColor = 'rgb(82, 88, 94)';
        } else {
            this.activeContainerBackgroundColor = 'rgb(220, 220, 220)';
        }
    }

    private onScreenResized() {
        this.movingController.getHTMLElements(this.gameService.playContainers.length);
        this.getContainerHTMLElemets();
    }

    private createStepsSubject() {
        if (this.stepsSubjectSubscription) {
            this.stepsSubjectSubscription.unsubscribe();
        }
        this.clicksSubject$ = new Subject<GameContainer>();
        this.stepsSubjectSubscription = this.clicksSubject$.pipe(
            concatMap(container => this.handleClick(container))).subscribe({
                next: (step: PlayStep | undefined) => {
                    if (step) {
                        this.gameService.steps.push(step);
                    }
                    this.movingInProgress = false;
                    this.checkGameFinished();
                },
                error: (error: HandleClickError) => {
                    // Interrupted by Restert or step back button
                    this.stoppingInProgress = false;
                    this.movingInProgress = false;
                    this.stepsSubjectSubscription.unsubscribe();
                    this.createStepsSubject();
                    this.stopMovingSubject$.next(error.shouldStepBack);
                }
            });
    }

    private handleClick(container: GameContainer): Observable<PlayStep | undefined> {
        return new Observable<PlayStep | undefined>(observer => {
            this.movingInProgress = true;
            if (this.selectedContainer) {
                if (container.index === this.selectedContainer.index) {
                    // Move colors back down
                    this.handleClickMoveDown(container, observer);
                } else {
                    if (container.isEmpty() || ((!container.isFull()) && container.peek() === this.movingController.getColor())) {
                        // Move colors if it is possible
                        this.handleClickMoveTo(container, observer);
                    } else {
                        // Nothing possible to move, then move down
                        this.handleClickMoveDown(this.selectedContainer, observer);
                    }
                }
            } else {
                // No selected container
                if (!container.isEmpty()) {
                    // We selected container, move colors up
                    this.handleClickMoveUp(container, observer);
                } else {
                    // Click somewhere nothing to do
                    observer.next();
                    observer.complete();
                }
            }
        });
    }

    private handleClickThrowError(subscriber: Subscriber<PlayStep | undefined>, message: string, shouldStepBack: boolean) {
        subscriber.error(<HandleClickError>{ message, shouldStepBack });
    }

    private handleClickMoveDown(container: GameContainer, subscriber: Subscriber<PlayStep | undefined>) {
        const movingCount = this.movingController.getVisibleMovingItems().length;
        this.movingController.moveDown(container, 0, movingCount).subscribe(() => {
            this.selectedContainer = undefined;
            if (this.stoppingInProgress) {
                subscriber.error(<HandleClickError>{ message: "Moving down back canceled", shouldStepBack: false });
            } else {
                subscriber.next();
                subscriber.complete();
            }
        });
    }

    private handleClickMoveTo(container: GameContainer, subscriber: Subscriber<PlayStep | undefined>) {
        const visibleCount = this.movingController.getVisibleMovingItems().length;
        const movingToCount = Math.min(CONTAINER_SIZE - container.size(), visibleCount);
        const movingDownCount = visibleCount - movingToCount;
        const fromIndex = this.selectedContainer!.index;
        this.movingController.moveTo(container, movingToCount).subscribe(() => {
            if (movingDownCount > 0) {
                this.movingController.moveDown(this.selectedContainer!, movingToCount, movingDownCount).subscribe(() => {
                    if (this.stoppingInProgress) {
                        this.movingController.moveToCancel(this.selectedContainer!, container, movingToCount);
                        this.selectedContainer = undefined;
                        this.handleClickThrowError(subscriber, "Moving to canceled", false);
                    } else {
                        this.selectedContainer = undefined;
                        subscriber.next(new PlayStep(fromIndex, container.index, movingToCount));
                        subscriber.complete();
                    }
                });
            } else {
                if (this.stoppingInProgress) {
                    this.movingController.moveToCancel(this.selectedContainer!, container, movingToCount);
                    this.selectedContainer = undefined;
                    this.handleClickThrowError(subscriber, "Moving to canceled", false);
                } else {
                    this.selectedContainer = undefined;
                    subscriber.next(new PlayStep(fromIndex, container.index, movingToCount));
                    subscriber.complete();
                }
            }
        });
    }

    private handleClickMoveUp(container: GameContainer, subscriber: Subscriber<PlayStep | undefined>) {
        const movingCount = container.getTopColorCount();
        this.movingController.moveUp(container, movingCount).subscribe(() => {
            if (this.stoppingInProgress) {
                this.movingController.moveUpCancel(container, movingCount);
                subscriber.error(<HandleClickError>{ message: "Moving up canceled.", shouldStepBack: false });
            } else {
                this.selectedContainer = container;
                subscriber.next();
                subscriber.complete();
            }
        });
    }

    protected backClick() {
        if (this.movingInProgress) {
            this.stoppingInProgress = true;
            const stopSubscriber = this.stopMovingSubject$.subscribe((shouldStepBack) => {
                stopSubscriber.unsubscribe();
                if (shouldStepBack) {
                    this.stepBack();
                }
            });
        } else {
            if (this.selectedContainer) {
                this.movingController.moveUpCancel(this.selectedContainer, this.movingController.getVisibleMovingItems().length);
                this.selectedContainer = undefined;
            } else {
                this.stepBack();
            }
        }
    }

    private stepBack() {
        const step = this.gameService.steps.pop();
        for (let i = 0; i < step!.count; i++) {
            this.gameService.playContainers[step!.iFrom].push(this.gameService.playContainers[step!.iTo].pop());
        }
    }

    protected restartClick() {
        this.cancelUnfinishedStep().subscribe(() => {
            // TODO: Ask confirmation
            this.restart();
        });
    }

    private restart() {
        this.gameService.playContainers = this.gameService.getContainers();
        this.gameService.steps = [];
        this.prepareBoard();
    }

    private prepareBoard() {
        this.createPlayContainers();
        const hash = GameController.getGameHash(this.gameService.getContainers());
        this.previousStepCount = this.statisticsService.getStepCount(hash);
        this.createStepsSubject();
        this.movingInProgress = false;
        this.stoppingInProgress = false;
        this.createPositionContainers();
        setTimeout(() => this.onScreenResized());
    }

    private createPlayContainers() {
        const containerCount = this.gameService.playContainers.length;
        let container1Count = containerCount;
        if (containerCount > MAX_CONTAINER_COUNT_IN_LINE) {
            container1Count = Math.ceil(containerCount / 2);
        }
        this.playContainers1 = this.gameService.playContainers.slice(0, container1Count);
        this.playContainers2 = this.gameService.playContainers.slice(container1Count, containerCount);
    }

    private getContainerByCoordinates(x: number, y: number): GameContainer | undefined {
        for (let i = 0; i < this.containerHTMLElements.length; i++) {
            const rect = this.containerHTMLElements[i].getBoundingClientRect();
            if (this.isInRect(x, y, rect)) {
                return this.gameService.playContainers[i];
            }
        }
        return undefined;
    }

    private isInRect(x: number, y: number, rect: DOMRect): boolean {
        return rect.x <= x && x <= rect.x + rect.width && rect.y <= y && y <= rect.y + rect.height;
    }

    private getContainerHTMLElemets() {
        this.containerHTMLElements = [];
        for (let containerIndex = 0; containerIndex < this.gameService.playContainers.length; containerIndex++) {
            const element = document.getElementById(Utils.getContainerId(containerIndex));
            if (element !== null) {
                this.containerHTMLElements.push(element);
            } else {
                console.error("Cannot find container HTMLelement.");
            }
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

    protected mainMenuClick() {
        this.cancelUnfinishedStep().subscribe(() => this.mainService.setView('menu'));
    }

    protected playClick() {
        this.cancelUnfinishedStep().subscribe(() => {
            this.gameService.createRandomGame(MAX_CONTAINER_COUNT - 2, MAX_CONTAINER_COUNT);
            this.prepareBoard();
        });
    }

    protected createClick() {
        this.cancelUnfinishedStep().subscribe(() => {
            this.gameService.setContainers(this.gameService.playContainers);
            this.gameService.fromContainersToSetupContainers();
            this.mainService.setView("setup");
        });
    }

    private cancelUnfinishedStep(): Observable<void> {
        return new Observable<void>(observer => {
            if (this.movingInProgress) {
                this.stoppingInProgress = true;
                const stopSubscriber = this.stopMovingSubject$.subscribe(() => {
                    stopSubscriber.unsubscribe();
                    observer.next();
                    observer.complete();
                });
            } else {
                if (this.selectedContainer) {
                    this.movingController.moveUpCancel(this.selectedContainer, this.movingController.getVisibleMovingItems().length);
                    this.selectedContainer = undefined;
                }
                observer.next();
                observer.complete();
            }
        });
    }

    protected saveClick() {
        this.cancelUnfinishedStep().subscribe(() => this.mainService.saveState());
    }

    protected loadClick() {
        this.cancelUnfinishedStep().subscribe(() => {
            // TODO: Confirm about lost current game
            this.mainService.setView('load');
        });
    }

    protected settingsClick() {
        this.cancelUnfinishedStep().subscribe(() => this.mainService.setView('settings'));
    }
    private createPositionContainers() {
        this.positionContainers1 = this.playContainers1.map(container => Utils.createPositionContainer(container.index));
        this.positionContainers2 = this.playContainers2.map(container => Utils.createPositionContainer(container.index));
    }

    protected solveClick() {
        this.cancelUnfinishedStep().subscribe(() => this.mainService.solve());
    }

    private checkGameFinished() {
        if (GameContainer.isResolvedContainers(this.gameService.playContainers)) {
            // TODO: At this moment we need to stop playing
            this.showPlayedDialog();
        }
    }

    private showPlayedDialog() {
        const config: MatDialogConfig<PlayedDialogData> = {
            data: { stepCount: this.gameService.steps.length },
            disableClose: true,
        };

        const dialogRef = this.dialog.open<PlayedDialogComponent, PlayedDialogData, PlayedDialogResult | undefined>(PlayedDialogComponent, config);

        dialogRef.afterClosed().subscribe(result => {
            if (result?.view === 'play') {
                this.prepareBoard();
            }
        });
    }

    protected onMouseUpDown(isUp: boolean, event: MouseEvent) {
        const x = event.clientX;
        const y = event.clientY;
        const container = this.getContainerByCoordinates(x, y);
        if (container) {
            if (isUp) {
                this.activeContainerIndex = container.index;
            } else {
                this.activeContainerIndex = undefined;
                this.clicksSubject$.next(container);
            }
        }
    }

    protected onMouseLeave() {
        this.activeContainerIndex = undefined;
    }

    protected onMouseEnter(event: MouseEvent, index: number) {
        if (event.buttons === 1) {
            this.activeContainerIndex = index;
        }
    }

    protected getContainerActiveStyle(containerIndex: number) {
        if (containerIndex === this.activeContainerIndex) {
            return {
                'backgroundColor': this.activeContainerBackgroundColor
            };
        }
        return undefined;
    }

    protected stopDisabled(): boolean {
        const enabled = (this.movingInProgress || this.gameService.steps.length > 0 || this.selectedContainer) && !this.stoppingInProgress;
        return !enabled;
    }

}
