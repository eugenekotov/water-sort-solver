import { Subscriber } from "rxjs";
import { Position } from "../components/board-solve/board-solve.component";
import { Item, itemCreate } from "./model/item.class";
import { PlayContainer } from "./model/play-container.class";
import { Color } from "./model/colors.class";
import { calculateMovingDuration, getItemIndex, getMovingPosition, getMovingTopCoordinate } from "./utils.class";

class MovingItem {

  color: Color | undefined;
  element: HTMLElement;
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
  speed: number; // TODO: change speed according to que size
  movingInProgress: boolean = false;
  stoppingInProgress: boolean = false;


  constructor() {
    for (let i = 0; i < 4; i++) {
      this.movingItems.push(new MovingItem());
    }
  }

  moveUp(container: PlayContainer, elements: HTMLElement[], parentMovingElementRect: DOMRect, observer: Subscriber<PlayContainer>) {
    setTimeout(() => {
      const movingCount = container.getTopColorCount();
      this.setColor(container.peek(), movingCount);
      this.setElement(container, elements, movingCount);
      this.setStartPosition(parentMovingElementRect, movingCount);
      this.pop(container, movingCount);
      this.setHidden(false, movingCount);
      // moving
      setTimeout(async () => {
        const topPositions = this.getTopPositions(parentMovingElementRect, this.movingItems[0].position.left, movingCount);
        await this.moving(topPositions);
        // if (this.stoppingInProgress) {
        //   this.moveDown(container, observer);
        //   container.selected = false;
        //   return;
        // }
        observer.next(container);
        observer.complete();
      }, 0);
    }, 0);
  }

  moveDown(container: PlayContainer, parentMovingElementRect: DOMRect, observer: Subscriber<PlayContainer>) {
    // moving
    setTimeout(async () => {
      const finishPositions = this.getFinishPositions(parentMovingElementRect);
      const movingCount = finishPositions.length;
      await this.moving(finishPositions);
      this.push(container, this.movingItems[0].color!, movingCount);
      this.setHidden(true, movingCount);
      // if (this.stoppingInProgress) {
      //   observer.error({ message: "Stop" });
      //   return;
      // }
      observer.next(container);
      observer.complete();
    }, 0);
  }

  getColor(): Color | undefined {
    return this.movingItems[0].color;
  }

  private setColor(color: Color, count: number) {
    for (let i = 0; i < count; i++) {
      this.movingItems[i].color = color;
    }
  }

  private setElement(container: PlayContainer, elements: HTMLElement[], count: number) {
    for (let i = 0; i < count; i++) {
      const index = getItemIndex(container.index, container.size() - 1 - i);
      this.movingItems[i].element = elements[index];
    }
  }

  private setStartPosition(parentRect: DOMRect, count: number) {
    for (let i = 0; i < count; i++) {
      const position = getMovingPosition(this.movingItems[i].element, parentRect);
      this.movingItems[i].position = position;
    }
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

  setHidden(hidden: boolean, count?: number) {
    if (count) {
      for (let i = 0; i < count; i++) {
        this.movingItems[i].hidden = hidden;
      }
    } else {
      this.movingItems.forEach(movingItem => movingItem.hidden = hidden);
    }
  }

  private getTopPositions(parentRect: DOMRect, left: number, count: number): Position[] {
    const result: Position[] = [];
    for (let i = 0; i < count; i++) {
      const topPosition = new Position(getMovingTopCoordinate(this.movingItems[i].element, parentRect), left);
      result.push(topPosition);
    }
    return result;
  }

  private getFinishPositions(parentRect: DOMRect): Position[] {
    const result: Position[] = [];
    let i = 0;
    while (this.movingItems[i].hidden === false) {
      const topPosition = getMovingPosition(this.movingItems[i].element, parentRect);
      result.push(topPosition);
      i++;
    }
    return result;
  }


  private async moving(positions: Position[]): Promise<void> {
    return new Promise<void>(resolve => {
      let max_moving_duration = 0;
      for (let i = 0; i < positions.length; i++) {
        const moving_duration = calculateMovingDuration(this.movingItems[i].position, positions[i], this.speed);
        max_moving_duration = Math.max(max_moving_duration, moving_duration);
        this.movingItems[i].transitionDuration = (moving_duration / 1000) + "s";
        this.movingItems[i].position = positions[i];
      }
      setTimeout(resolve, max_moving_duration);
    });
  }


}
