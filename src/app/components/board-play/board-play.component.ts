import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Item, itemCreate } from 'src/app/classes/model/item.class';
import { MainService } from 'src/app/services/main.service';
import { PlayStep, Position } from '../board-solve/board-solve.component';
import { concatMap, Observable, Subject, Subscriber, Subscription } from 'rxjs';
import { containerIsEmpty, containerIsFull, containerPeek, containerPop, containerPush, containerSize, PlayContainer } from 'src/app/classes/model/play-container.class';
import { ContainerComponent } from '../container/container.component';
import { calculateMovingDuration } from 'src/app/classes/utils.class';
import { Color } from 'src/app/classes/model/colors.class';

@Component({
  selector: 'app-board-play',
  templateUrl: './board-play.component.html',
  styleUrls: ['./board-play.component.scss']
})
export class BoardPlayComponent implements OnInit, AfterViewInit, OnDestroy {

  playContainers: PlayContainer[] = [];
  private screenResizedSubscription: Subscription | undefined = undefined;

  steps: PlayStep[] = [];

  private itemsElements: HTMLElement[] = [];
  private parentMovingElementRect: any;

  completeStepIndex: number = 0;

  readonly minSpeed = 1;
  readonly maxSpeed = 20;
  readonly defaultSpeed = 5;
  speed: number = this.defaultSpeed; // TODO: change speed according to que size

  playing: boolean = false;

  private clicksSubject$ = new Subject<PlayContainer>();
  private stepsSubjectSubscription: Subscription;
  movingItem: Item; // Item for moving animation
  private movingCurrentPosition: Position;


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
    this.stepsSubjectSubscription.unsubscribe();
  }

  private createStepsSubject() {
    this.clicksSubject$ = new Subject<PlayContainer>();
    this.stepsSubjectSubscription = this.clicksSubject$.pipe(
      concatMap(container => this.makeAction(container)))
      .subscribe(() => {
        // TODO: Here we need check is container or board resolved
      });
  }

  private makeAction(container: PlayContainer): Observable<void> {
    return new Observable(observer => {
      const selectedContainer = this.getSelectedContainer();
      if (selectedContainer) {
        if (container.selected) {
          // Move colors back down
          this.moveDown(container, observer);
          container.selected = false;
        } else {
          if (containerIsEmpty(container) || (!containerIsFull(container) && containerPeek(container) === this.movingItem.color)) {
            // Move colors if it is possible
            this.moveTo(container, observer);
            this.steps.push(new PlayStep(this.steps.length, selectedContainer.index, container.index));
          } else {
            this.moveDown(selectedContainer, observer);
          }
          selectedContainer.selected = false;
        }
      } else {
        // No selected container
        if (!containerIsEmpty(container)) {
          // try to guess step
          const containerTo = this.findPossibleStep(container);
          if (containerTo) {
            // We can make step
            this.moveUpTo(container, containerTo, observer);
            this.steps.push(new PlayStep(this.steps.length, container.index, containerTo.index));
          } else {
            // We selected container, move colors up
            this.moveUp(container, observer);
            container.selected = true;
          }
        } else {
          observer.next();
          observer.complete();
        }
      }
    });
  }

  private findPossibleStep(container: PlayContainer): PlayContainer | undefined {
    // do we have this color
    let possibleContainer: PlayContainer | undefined = undefined;
    for (let i = 0; i < this.playContainers.length; i++) {
      if (this.isPossible(this.playContainers[i], container.index, containerPeek(container))) {
        if (possibleContainer !== undefined) {
          // we have more the only one option
          return undefined;
        } else {
          possibleContainer = this.playContainers[i];
        }
      }
    }
    if (possibleContainer === undefined) {
      // try to find empty container
      possibleContainer = this.playContainers.find(cont => containerIsEmpty(cont));
    }
    return possibleContainer;
  }

  private isPossible(container: PlayContainer, excludeIndex: number, color: Color): boolean {
    if (container.index === excludeIndex) {
      return false;
    }
    if (containerIsEmpty(container)) {
      return false;
    }
    if (!containerIsFull(container) && containerPeek(container) === color) {
      return true;
    }
    return false;
  }

  private moveUp(container: PlayContainer, observer: Subscriber<void>) {
    setTimeout(() => {
      this.movingItem.color = containerPeek(container);
      const startPosition = this.getMovingPosition(container.index, containerSize(container) - 1);
      this.setMovingPosition(startPosition);
      containerPop(container);
      this.movingItem.hidden = false;
      // moving
      setTimeout(async () => {
        const topPosition = new Position(this.getMovingTopPosition(container.index), startPosition.left);
        await this.moving(startPosition, topPosition);
        observer.next();
        observer.complete();
      }, 0);
    }, 0);
  }

  private moveDown(container: PlayContainer, observer: Subscriber<void>) {
    // moving
    setTimeout(async () => {
      const finishPosition = this.getMovingPosition(container.index, containerSize(container));
      await this.moving(this.movingCurrentPosition, finishPosition);
      containerPush(container, this.movingItem.color!);
      this.movingItem.hidden = true;
      observer.next();
      observer.complete();
    }, 0);
  }

  private moveTo(container: PlayContainer, observer: Subscriber<void>) {
    // moving
    setTimeout(async () => {
      const startPosition = this.movingCurrentPosition;
      const finishPosition = this.getMovingPosition(container.index, containerSize(container));
      const leftPosition = new Position(this.getMovingTopPosition(container.index), finishPosition.left);
      await this.moving(startPosition, leftPosition);
      await this.moving(leftPosition, finishPosition);
      containerPush(container, this.movingItem.color!);
      this.movingItem.hidden = true;
      observer.next();
      observer.complete();
    }, 0);
  }

  private moveUpTo(containerFrom: PlayContainer, containerTo: PlayContainer, observer: Subscriber<void>) {
    setTimeout(() => {
      this.movingItem.color = containerPeek(containerFrom);
      const startPosition = this.getMovingPosition(containerFrom.index, containerSize(containerFrom) - 1);
      this.setMovingPosition(startPosition);
      containerPop(containerFrom);
      this.movingItem.hidden = false;
      // moving
      setTimeout(async () => {
        const topPosition = new Position(this.getMovingTopPosition(containerFrom.index), startPosition.left);
        const finishPosition = this.getMovingPosition(containerTo.index, containerSize(containerTo));
        const leftPosition = new Position(this.getMovingTopPosition(containerTo.index), finishPosition.left);
        await this.moving(startPosition, topPosition);
        await this.moving(topPosition, leftPosition);
        await this.moving(leftPosition, finishPosition);
        containerPush(containerTo, this.movingItem.color!);
        this.movingItem.hidden = true;
        observer.next();
        observer.complete();
      }, 0);
    }, 0);

  }


  private async moving(from: Position, to: Position): Promise<void> {
    return new Promise<void>(resolve => {
      const moving_duration1 = calculateMovingDuration(from, to, this.speed);
      this.movingItem.transitionDuration = (moving_duration1 / 1000) + "s";
      this.setMovingPosition(to);
      setTimeout(resolve, moving_duration1);
    });
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

  speedChanged(event: any) {
    const speed = Number(event);
    this.saveSpeed(speed);
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

  private hasSelectedContainer(): boolean {
    return this.playContainers.some(BoardPlayComponent.selectedContainerPredicate);
  }

  private getMovingPosition(containerIndex: number, itemIndex: number): Position {
    const index = containerIndex * PlayContainer.MAX_SIZE + itemIndex;
    const itemElement = this.itemsElements[index];
    const itemRect = itemElement!.getBoundingClientRect();
    const top = itemRect.top - this.parentMovingElementRect.top;
    const left = itemRect.left - this.parentMovingElementRect.left;
    return new Position(top, left);
  }

  private getMovingTopPosition(containerIndex: number): number {
    const index = containerIndex * PlayContainer.MAX_SIZE + PlayContainer.MAX_SIZE - 1;
    const itemElement = this.itemsElements[index];
    const itemRect = itemElement!.getBoundingClientRect();
    const top = itemRect.top - this.parentMovingElementRect.top - itemRect.height * 2;
    return top;
  }

  private setMovingPosition(position: Position) {
    this.movingCurrentPosition = position;
    this.movingItem.top = `${position.top}px`;
    this.movingItem.left = `${position.left}px`;
  }

  backClick() {

  }

}
