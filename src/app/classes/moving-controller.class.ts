import { concat, last, Observable } from "rxjs";
import { ContainerComponent } from "../components/container/container.component";
import { MainService } from "../services/main.service";
import { Color } from "./model/colors.class";
import { GameContainer } from "./model/game/game-container.class";
import { MovingItem, Position } from "./model/item.class";
import { PlayContainer } from "./model/play-container.class";
import { getItemIndex, getMovingPosition } from "./utils.class";
import { CONTAINER_SIZE } from "./model/const.class";


export class MovingController {

  movingItems: MovingItem[] = []; // Items for moving animation

  private itemsElements: HTMLElement[] = [];
  private parentElementRect: DOMRect;

  stoppingInProgress: boolean = false;


  constructor(private mainService: MainService) {
    for (let i = 0; i < 4; i++) {
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
    //
    this.parentElementRect = document.getElementById("moving")!.parentElement!.getBoundingClientRect();
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
    //
    this.parentElementRect = document.getElementById("moving")!.parentElement!.getBoundingClientRect();
  }

  moveUp(container: PlayContainer, movingCount: number): Observable<void> {
    return new Observable<void>(observer => {
      setTimeout(() => {
        this.parentElementRect = document.getElementById("moving-parent")!.getBoundingClientRect();
        const movingItems = this.getMovingItems(0, movingCount);
        this.setColor(movingItems, container.peek());
        const elements = this.getElements(container.index, container.size() - 1, movingCount);
        const startPositions = this.getBottomPositions(elements);
        this.setPositions(movingItems, startPositions);
        this.pop(container, movingCount);
        this.setHidden(movingItems, false);
        // moving
        setTimeout(async () => {
          const topPositions = this.getTopPositions(elements);
          await this.moving(movingItems, topPositions);
          if (this.stoppingInProgress) {
            this.moveDown(container, 0, movingCount).subscribe(() => {
              observer.next();
              observer.complete();
              return;
            });
          }
          observer.next();
          observer.complete();
        });
      });
    });
  }

  moveUp2(container: GameContainer, movingCount: number): Observable<void> {
    return new Observable<void>(observer => {
      setTimeout(() => {
        this.parentElementRect = document.getElementById("moving-parent")!.getBoundingClientRect();
        const movingItems = this.getMovingItems(0, movingCount);
        this.setColor(movingItems, container.peek());
        const elements = this.getElements(container.index, container.size() - 1, movingCount);
        const startPositions = this.getBottomPositions(elements);
        this.setPositions(movingItems, startPositions);
        this.pop2(container, movingCount);
        this.setHidden(movingItems, false);
        // moving
        setTimeout(async () => {
          const topPositions = this.getTopPositions(elements);
          await this.moving(movingItems, topPositions);
          if (this.stoppingInProgress) {
            this.moveDown2(container, 0, movingCount).subscribe(() => {
              observer.next();
              observer.complete();
              return;
            });
          }
          observer.next();
          observer.complete();
        });
      });
    });
  }


  moveDown(container: PlayContainer, movingItemsIndex: number, movingCount: number): Observable<void> {
    return new Observable<void>(observer => {
      setTimeout(async () => {
        const movingItems = this.getMovingItems(movingItemsIndex, movingCount);
        const elements = this.getElements(container.index, container.size() - 1 + movingCount, movingCount);
        const finishPositions = this.getBottomPositions(elements);
        await this.moving(movingItems, finishPositions);
        this.push(container, this.movingItems[0].color!, movingCount);
        this.setHidden(movingItems, true);
        if (this.stoppingInProgress) {
          observer.error({ message: "Stop" });
          return;
        }
        observer.next();
        observer.complete();
      });
    });
  }

  moveDown2(container: GameContainer, movingItemsIndex: number, movingCount: number): Observable<void> {
    return new Observable<void>(observer => {
      setTimeout(async () => {
        const movingItems = this.getMovingItems(movingItemsIndex, movingCount);
        const elements = this.getElements(container.index, container.size() - 1 + movingCount, movingCount);
        const finishPositions = this.getBottomPositions(elements);
        await this.moving(movingItems, finishPositions);
        this.push2(container, this.movingItems[0].color!, movingCount);
        this.setHidden(movingItems, true);
        if (this.stoppingInProgress) {
          observer.error({ message: "Stop" });
          return;
        }
        observer.next();
        observer.complete();
      });
    });
  }


  moveTo(container: PlayContainer, movingToCount: number): Observable<void> {
    return new Observable<void>(observer => {
      setTimeout(async () => {
        const movingToItems: MovingItem[] = this.getMovingItems(0, movingToCount);
        const elements = this.getElements(container.index, container.size() - 1 + movingToCount, movingToCount);
        const finishPositions = this.getBottomPositions(elements);
        await this.moving(movingToItems, finishPositions);
        this.push(container, this.movingItems[0].color!, movingToCount);
        this.setHidden(movingToItems, true);
        observer.next();
        observer.complete();
      });
    });
  }

  moveTo2(container: GameContainer, movingToCount: number): Observable<void> {
    return new Observable<void>(observer => {
      setTimeout(async () => {
        const movingToItems: MovingItem[] = this.getMovingItems(0, movingToCount);
        const elements = this.getElements(container.index, container.size() - 1 + movingToCount, movingToCount);
        const finishPositions = this.getBottomPositions(elements);
        await this.moving(movingToItems, finishPositions);
        this.push2(container, this.movingItems[0].color!, movingToCount);
        this.setHidden(movingToItems, true);
        observer.next();
        observer.complete();
      });
    });
  }

  moveFromTo(containerFrom: GameContainer, containerTo: GameContainer, movingCount: number): Observable<void> {
    return concat(this.moveUp2(containerFrom, movingCount), this.moveTo2(containerTo, movingCount)).pipe(last());
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

  private pop2(container: GameContainer, count: number) {
    for (let i = 0; i < count; i++) {
      container.pop();
    }
  }


  private push(container: PlayContainer, color: Color, count: number): void {
    for (let i = 0; i < count; i++) {
      container.push(color);
    }
  }

  private push2(container: GameContainer, color: Color, count: number): void {
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
    const top = itemRect.top - parentRect.top - itemRect.height * 1.3;
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
        const moving_duration = MovingController.calculateMovingDuration(movingItems[i].position, positions[i], this.mainService.speed);
        max_moving_duration = Math.max(max_moving_duration, moving_duration);
        movingItems[i].transitionDuration = (moving_duration / 1000) + "s";
        movingItems[i].position = positions[i];
      }
      setTimeout(resolve, max_moving_duration);
    });
  }

  public getVisibleMovingItems(): MovingItem[] {
    return this.movingItems.filter(item => item.hidden === false);
  }

  private getMovingItems(firstIndex: number, count: number): MovingItem[] {
    return this.movingItems.slice(firstIndex, count);
  }

  static async moving(movingItem: MovingItem, from: Position, to: Position, speed: number): Promise<void> {
    return new Promise<void>(resolve => {
      const moving_duration1 = MovingController.calculateMovingDuration(from, to, speed);
      movingItem.transitionDuration = (moving_duration1 / 1000) + "s";
      movingItem.position = to;
      setTimeout(resolve, moving_duration1);
    });
  }

  static calculateMovingDuration(from: Position, to: Position, speed: number): number {
    const way = Math.sqrt(Math.pow(to.top - from.top, 2) + Math.pow(to.left - from.left, 2));
    return (200 + way * 0.5) * 15 / speed;
  }

}
