import { Observable, Subscriber } from "rxjs";
import { PlayStep } from "../components/board-play/board-play.component";
import { ContainerComponent } from "../components/container/container.component";
import { MainService } from "../services/main.service";
import { Color } from "./model/colors.class";
import { CONTAINER_SIZE } from "./model/const.class";
import { GameContainer } from "./model/game/game-container.class";
import { MovingItem, Position } from "./model/item.class";
import { PlayContainer } from "./model/play-container.class";
import { getItemIndex } from "./utils.class";


export class MovingController {

  private readonly MOVING_HEIGHT = 35;

  movingItems: MovingItem[] = []; // Items for moving animation

  private itemsElements: HTMLElement[] = [];

  public movingInProgress: boolean = false;
  public stoppingInProgress: boolean = false;


  constructor(private mainService: MainService) {
    for (let i = 0; i < CONTAINER_SIZE; i++) {
      this.movingItems.push(new MovingItem());
    }
  }

  getHTMLElements(playContainers: PlayContainer[]) {
    this.itemsElements = [];
    for (let containerIndex = 0; containerIndex < playContainers.length; containerIndex++) {
      const container = playContainers[containerIndex];
      for (let itemIndex = 0; itemIndex < container.items.length; itemIndex++) {
        this.itemsElements.push(document.getElementById(ContainerComponent.getElementId(containerIndex, itemIndex))!);
      }
    }
  }

  getHTMLElements2(containerCount: number) {
    this.itemsElements = [];
    for (let containerIndex = 0; containerIndex < containerCount; containerIndex++) {
      for (let itemIndex = 0; itemIndex < CONTAINER_SIZE; itemIndex++) {
        const elementId = ContainerComponent.getElementId(containerIndex, itemIndex);
        const element = document.getElementById(elementId);
        if (element !== null) {
          this.itemsElements.push(element);
        } else {
          throw new Error(`Cannot get HTML element with id ${elementId}`);
        }
      }
    }
  }

  moveUp(container: GameContainer, observer: Subscriber<PlayStep | undefined>) {
    setTimeout(() => {
      const parentElementRect = this.getMovingParentRect();
      const movingCount = container.getTopColorCount();
      const movingItems = this.getMovingItems(movingCount);
      this.setColor(movingItems, container.peek());
      const elements = this.getElements(container.index, container.size() - 1, movingCount);
      const startPositions = this.getElementsPositions(elements, parentElementRect);
      this.setPositions(movingItems, startPositions);
      this.pop(container, movingCount);
      this.setHidden(movingItems, false);
      // moving
      setTimeout(async () => {
        await this.moving(movingItems, 0, -this.MOVING_HEIGHT);
        if (this.stoppingInProgress) {
          this.moveDown(container, observer);
          return;
        }
        observer.next();
        observer.complete();
      }, 0);
    }, 0);
  }

  moveDown(container: GameContainer, observer: Subscriber<PlayStep | undefined>) {
    setTimeout(async () => {
      const movingItems = this.getVisibleMovingItems();
      const movingCount = movingItems.length;
      await this.moving(movingItems, 0, this.MOVING_HEIGHT);
      this.push(container, this.movingItems[0].color!, movingCount);
      this.setHidden(movingItems, true);
      if (this.stoppingInProgress) {
        observer.error({ message: "Stop" });
        return;
      }
      observer.next();
      observer.complete();
    }, 0);
  }

  moveTo(containerFrom: GameContainer, containerTo: GameContainer, observer: Subscriber<PlayStep | undefined>) {
    setTimeout(async () => {
      const parentElementRect = this.getMovingParentRect();
      const visibleCount = this.movingItems.reduce((accumulator, movingItem) => !movingItem.hidden ? accumulator + 1 : accumulator, 0);
      const movingToCount = Math.min(CONTAINER_SIZE - containerTo.size(), visibleCount);
      const movingDownCount = visibleCount - movingToCount;
      const movingToItems: MovingItem[] = this.movingItems.slice(0, movingToCount);
      const movingDownItems: MovingItem[] = this.movingItems.slice(movingToCount, movingToCount + movingDownCount);
      // down
      if (movingDownCount > 0) {
        await this.moving(movingDownItems, 0, this.MOVING_HEIGHT);
        this.push(containerFrom, this.movingItems[0].color!, movingDownCount);
        this.setHidden(movingDownItems, true);
        if (this.stoppingInProgress) {
          observer.error({ message: "Stop" });
          return;
        }
      }
      // to
      if (movingToCount > 0) {
        const element0To = this.getElement(containerTo.index, containerTo.size() - 1 + movingToCount);
        const finishPositionTo = this.getElementPosition(element0To, parentElementRect);
        const x = finishPositionTo.x - movingToItems[0].position.x;
        const y = finishPositionTo.y - movingToItems[0].position.y;
        await this.moving(movingToItems, x, y);
        this.push(containerTo, this.movingItems[0].color!, movingToCount);
        this.setHidden(movingToItems, true);
      }
      observer.next(new PlayStep(containerFrom.index, containerTo.index, movingToCount));
      observer.complete();
    }, 0);
  }

  moveFromTo(containerFrom: GameContainer, containerTo: GameContainer): Observable<void> {
    return new Observable<void>(observer => {
      const upObservable = new Observable<PlayStep | undefined>(upObserver => {
        this.moveUp(containerFrom, upObserver);
      });
      upObservable.subscribe(_ => {
        const moveToObservable = new Observable<PlayStep | undefined>(moveToObserver => {
          this.moveTo(containerFrom, containerTo, moveToObserver);
        });
        moveToObservable.subscribe(_ => {
          observer.next();
          observer.complete();
        });
      });
    });
  }

  getColor(): Color | undefined {
    return this.movingItems[0].color;
  }

  private setColor(movingItems: MovingItem[], color: Color) {
    movingItems.forEach(movingItem => movingItem.color = color);
  }

  private getElements(containerIndex: number, first: number, count: number): HTMLElement[] {
    const result: HTMLElement[] = [];
    for (let i = 0; i < count; i++) {
      const index = getItemIndex(containerIndex, first - i);
      result.push(this.itemsElements[index]);
    }
    return result;
  }

  private getElement(containerIndex: number, colorIndex: number): HTMLElement {
    const index = getItemIndex(containerIndex, colorIndex);
    return this.itemsElements[index];
  }


  private getElementsPositions(elements: HTMLElement[], parentElementRect: DOMRect): Position[] {
    return elements.map(element => this.getElementPosition(element, parentElementRect));
  }

  private setPositions(movingItems: MovingItem[], position: Position[]): void {
    movingItems.forEach((movingItem, index) => movingItem.position = position[index]);
  }

  private getElementPosition(itemElement: HTMLElement, parentRect: DOMRect): Position {
    const itemRect = itemElement.getBoundingClientRect();
    const top = itemRect.top - parentRect.top - 1;
    const left = itemRect.left - parentRect.left - 1;
    return new Position(left, top);
  }

  private pop(container: GameContainer, count: number) {
    for (let i = 0; i < count; i++) {
      container.pop();
    }
  }

  private push(container: GameContainer, color: Color, count: number): void {
    for (let i = 0; i < count; i++) {
      container.push(color);
    }
  }

  setHidden(movingItems: MovingItem[], hidden: boolean) {
    movingItems.forEach(movingItem => movingItem.hidden = hidden);
  }

  private async moving(movingItems: MovingItem[], x: number, y: number): Promise<void> {
    return new Promise<void>(resolve => {
      const moving_duration = MovingController.calculateMovingDuration(x, y, this.mainService.speed);
      movingItems.forEach(movingItem => {
        movingItem.transitionDuration = (moving_duration / 1000) + "s";
        movingItem.position = new Position(movingItem.position.x + x, movingItem.position.y + y);
      });
      setTimeout(resolve, moving_duration);
    });
  }

  private getMovingParentRect(): DOMRect {
    const element = document.getElementById("moving-parent");
    if (element !== null) {
      return element.getBoundingClientRect();
    }
    throw new Error("Cannot find moving-parent element.");
  }

  private getVisibleMovingItems(): MovingItem[] {
    const result: MovingItem[] = [];
    let i = 0;
    while (i < this.movingItems.length && this.movingItems[i].hidden === false) {
      result.push(this.movingItems[i]);
      i++;
    }
    return result;
  }

  private getMovingItems(count: number): MovingItem[] {
    return this.movingItems.slice(0, count);
  }

  static async moving(movingItem: MovingItem, from: Position, to: Position, speed: number): Promise<void> {
    return new Promise<void>(resolve => {
      const moving_duration = MovingController.calculateMovingDuration2(from, to, speed);
      movingItem.transitionDuration = (moving_duration / 1000) + "s";
      movingItem.position = to;
      setTimeout(resolve, moving_duration);
    });
  }

  static calculateMovingDuration2(from: Position, to: Position, speed: number): number {
    const way = Math.sqrt(Math.pow(to.y - from.y, 2) + Math.pow(to.x - from.x, 2));
    return (200 + way * 0.5) * 15 / speed;
  }

  static calculateMovingDuration(x: number, y: number, speed: number): number {
    const way = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    return (200 + way * 0.5) * 15 / speed;
  }


}
