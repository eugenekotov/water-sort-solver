import { Subscriber } from "rxjs";
import { Position } from "../components/board-solve/board-solve.component";
import { ContainerComponent } from "../components/container/container.component";
import { Color } from "./model/colors.class";
import { PlayContainer } from "./model/play-container.class";
import { calculateMovingDuration, getItemIndex, getMovingPosition } from "./utils.class";

type TOrder = "ascending" | "descending";

class MovingItem {

  color: Color | undefined;
  private _position: Position;
  containerIndex: number;
  hidden: boolean = true;
  top: string | undefined;
  left: string | undefined;
  transitionDuration: string | undefined;

  set position(position: Position) {
    this._position = position;
    this.top = `${position.top}px`;
    this.left = `${position.left}px`;
  }

  get position(): Position {
    return this._position;
  }

}


export class MovingController {

  movingItems: MovingItem[] = []; // Items for moving animation

  private itemsElements: HTMLElement[] = [];
  private parentElementRect: DOMRect;


  speed: number; // TODO: change speed according to que size
  stoppingInProgress: boolean = false;


  constructor() {
    for (let i = 0; i < 4; i++) {
      this.movingItems.push(new MovingItem());
    }
  }

  getHTMLElements(playContainers: PlayContainer[]) {
    this.itemsElements = [];
    for (let containerIndex = 0; containerIndex < playContainers.length; containerIndex++) {
      const container = playContainers[containerIndex];
      for (let itemIndex = 0; itemIndex < container.items.length; itemIndex++) {
        this.itemsElements.push(document.getElementById(ContainerComponent.getItemId(containerIndex, itemIndex))!);
      }
    }
    //
    this.parentElementRect = document.getElementById("moving")!.parentElement!.getBoundingClientRect();
  }

  moveUp(container: PlayContainer, observer: Subscriber<PlayContainer>) {
    setTimeout(() => {
      const movingCount = container.getTopColorCount();
      const movingItems = this.getMovingItems(movingCount);
      this.setColor(movingItems, container.peek());
      const elements = this.getElements(container, container.size() - 1, movingCount, "ascending");
      const startPositions = this.getBottomPositions(elements);
      this.setPositions(movingItems, startPositions);
      this.pop(container, movingCount);
      this.setHidden(movingItems, false);
      // moving
      setTimeout(async () => {
        const topPositions = this.getTopPositions(elements);
        await this.moving(movingItems, topPositions);
        if (this.stoppingInProgress) {
          this.moveDown(container, observer);
          container.selected = false;
          return;
        }
        observer.next(container);
        observer.complete();
      }, 0);
    }, 0);
  }

  moveDown(container: PlayContainer, observer: Subscriber<PlayContainer>) {
    setTimeout(async () => {
      const movingItems = this.getVisibleMovingItems();
      const movingCount = movingItems.length;
      const elements = this.getElements(container, container.size() - 1 + movingCount, movingCount, "ascending");
      const finishPositions = this.getBottomPositions(elements);
      await this.moving(movingItems, finishPositions);
      this.push(container, this.movingItems[0].color!, movingCount);
      this.setHidden(movingItems, true);
      if (this.stoppingInProgress) {
        observer.error({ message: "Stop" });
        return;
      }
      observer.next(container);
      observer.complete();
    }, 0);
  }

  moveTo(containerFrom: PlayContainer, containerTo: PlayContainer, observer: Subscriber<PlayContainer>) {
    setTimeout(async () => {
      const visibleCount = this.movingItems.reduce((accumulator, movingItem) => !movingItem.hidden ? accumulator + 1 : accumulator, 0);
      const movingToCount = Math.min(PlayContainer.MAX_SIZE - containerTo.size(), visibleCount);
      const movingDownCount = visibleCount - movingToCount;
      const movingToItems: MovingItem[] = [];
      const movingDownItems: MovingItem[] = [];
      for (let i = 0; i < visibleCount; i++) {
        if (i < movingToCount) {
          movingToItems.push(this.movingItems[i]);
        } else {
          movingDownItems.push(this.movingItems[i]);
        }
      }
      // down
      const elementsDown = this.getElements(containerFrom, containerFrom.size() - 1 + movingDownCount, movingDownCount, "ascending");
      const finishPositionsDown = this.getBottomPositions(elementsDown);
      await this.moving(movingDownItems, finishPositionsDown);
      this.push(containerFrom, this.movingItems[0].color!, movingDownCount);
      this.setHidden(movingDownItems, true);
      if (this.stoppingInProgress) {
        observer.error({ message: "Stop" });
        return;
      }
      observer.next(containerTo);
      observer.complete();




      // const startPosition = this.movingCurrentPosition;
      // const index = getItemIndex(container.index, PlayContainer.size(container));
      // const finishPosition = getMovingPosition(this.itemsElements[index], this.parentElementRect);
      // const leftPosition = new Position(this.getMovingTopCoordinate(container.index), finishPosition.left);
      // await this.moving(startPosition, leftPosition);
      // await this.moving(leftPosition, finishPosition);
      // PlayContainer.push(container, this.movingItem.color!);
      // this.movingItem.hidden = true;
      // if (this.stoppingInProgress) {
      //   observer.error({ message: "Stop" });
      //   return;
      // }
    }, 0);
  }


  getColor(): Color | undefined {
    return this.movingItems[0].color;
  }

  private setColor(movingItems: MovingItem[], color: Color) {
    movingItems.forEach(movingItem => movingItem.color = color);
  }

  private getElements(container: PlayContainer, first: number, count: number, order: TOrder): HTMLElement[] {
    const result: HTMLElement[] = [];
    if (order === "ascending") {
      for (let i = 0; i < count; i++) {
        const index = getItemIndex(container.index, first - i);
        result.push(this.itemsElements[index]);
      }
    } else if (order === "descending") {
      for (let i = count - 1; i >= 0; i--) {
        const index = getItemIndex(container.index, first - i);
        result.push(this.itemsElements[index]);
      }
    } else {
      const _n: never = order;
    }
    return result;
  }

  private getBottomPositions(elements: HTMLElement[]): Position[] {
    const result: Position[] = [];
    for (let i = 0; i < elements.length; i++) {
      const position = getMovingPosition(elements[i], this.parentElementRect);
      result.push(position);
    }
    return result;
  }

  private setPositions(movingItems: MovingItem[], position: Position[]): void {
    for (let i = 0; i < movingItems.length; i++) {
      movingItems[i].position = position[i];
    }
  }


  private getMovingPosition(itemElement: HTMLElement, parentRect: DOMRect): Position {
    const itemRect = itemElement.getBoundingClientRect();
    const top = itemRect.top - parentRect.top - 1;
    const left = itemRect.left - parentRect.left - 1;
    return new Position(top, left);
  }


  private pop(container: PlayContainer, count: number) {
    for (let i = 0; i < count; i++) {
      container.pop();
    }
  }

  private push(container: PlayContainer, color: Color, count: number): void {
    for (let i = 0; i < count; i++) {
      container.push(color);
    }
  }

  setHidden(movingItems: MovingItem[], hidden: boolean) {
    movingItems.forEach(movingItem => movingItem.hidden = hidden);
  }

  private getTopPositions(elements: HTMLElement[]): Position[] {
    return elements.map(element => this.getMovingTopPosition(element, this.parentElementRect));
  }

  private getMovingTopPosition(itemElement: HTMLElement, parentRect: DOMRect): Position {
    const itemRect = itemElement!.getBoundingClientRect();
    const top = itemRect.top - parentRect.top - itemRect.height * 2;
    const left = itemRect.left - parentRect.left - 1;
    return new Position(top, left);
  }

  // private getFinishPositions(parentRect: DOMRect): Position[] {
  //   const result: Position[] = [];
  //   let i = 0;
  //   while (this.movingItems[i].hidden === false) {
  //     const position = getMovingPosition(this.movingItems[i].element, parentRect);
  //     result.push(position);
  //     i++;
  //   }
  //   return result;
  // }


  private async moving(movingItems: MovingItem[], positions: Position[]): Promise<void> {
    return new Promise<void>(resolve => {
      let max_moving_duration = 0;
      for (let i = 0; i < movingItems.length; i++) {
        const moving_duration = calculateMovingDuration(movingItems[i].position, positions[i], this.speed);
        max_moving_duration = Math.max(max_moving_duration, moving_duration);
        movingItems[i].transitionDuration = (moving_duration / 1000) + "s";
        movingItems[i].position = positions[i];
      }
      setTimeout(resolve, max_moving_duration);
    });
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
    const result: MovingItem[] = [];
    for (let i = 0; i < count; i++) {
      result.push(this.movingItems[i]);
    }
    return result;
  }


}
