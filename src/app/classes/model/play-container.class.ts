import { Color } from "./colors.class";
import { CONTAINER_SIZE } from "./const.class";
import { Item, itemCreate } from "./item.class";


/**
 * static methods added to use them from web-worker
 */
export class PlayContainer {

  resolved = false;

  /**
   * Structure Items stores items like stack with indexes
   *
   *  |   | <- push, pop
   *  | 3 |
   *  | 2 |
   *  | 1 |
   *  | 0 |
   *  -----
   *
   */

  _size: number = 0;
  index: number;
  items: Item[] = [];
  selected: boolean = false;

  getTopColorCount(): number {
    return PlayContainer.getTopColorCount(this);
  }

  static getTopColorCount(container: PlayContainer): number {
    if (PlayContainer.isEmpty(container)) {
      return 0;
    }
    let result = 1;
    const color = PlayContainer.peek(container);
    let i = PlayContainer.size(container) - 2;
    while (i >= 0 && container.items[i].color === color) {
      result++;
      i--;
    }
    return result
  }

  peek(): Color {
    return PlayContainer.peek(this);
  }

  static peek(container: PlayContainer): Color {
    const size = PlayContainer.size(container);
    if (size == 0) {
      throw Error("Container is empty.");
    }
    return container.items[size - 1].color!;
  }

  size(): number {
    return this._size;
  }

  static size(container: PlayContainer) {
    return container._size
  }

  pop(): Color {
    return PlayContainer.pop(this);
  }

  static pop(container: PlayContainer): Color {
    const size = container.size();
    if (size == 0) {
      throw Error("Container is empty.");
    }
    const color = container.items[size - 1].color!;
    container.items[size - 1].color = undefined;
    PlayContainer.afterChange(container);
    return color;
  }

  push(color: Color): void {
    PlayContainer.push(this, color);
  }

  static push(container: PlayContainer, color: Color): void {
    // Search first empty item
    const size = PlayContainer.size(container);
    if (size == CONTAINER_SIZE) {
      throw Error("Size limit exists.");
    }
    container.items[size].color = color;
    PlayContainer.afterChange(container);
  }

  isEmpty(): boolean {
    return PlayContainer.isEmpty(this);
  }

  static isEmpty(container: PlayContainer): boolean {
    return container.items[0].color === undefined;
  }

  isFull(): boolean {
    return PlayContainer.isFull(this);
  }

  static isFull(container: PlayContainer): boolean {
    return PlayContainer.size(container) === CONTAINER_SIZE;
  }

  static afterChange(container: PlayContainer) {
    PlayContainer.calculateSize(container);
    PlayContainer.checkResolved(container);
  }

  private static calculateSize(container: PlayContainer) {
    container._size = container.items.findIndex(item => item.color === undefined);
    if (container._size === -1) {
      container._size = CONTAINER_SIZE;
    }
  }

  private static checkResolved(container: PlayContainer): void {
    if (PlayContainer.size(container) !== CONTAINER_SIZE) {
      container.resolved = false;
    } else {
      container.resolved = container.items.every(item => item.color === PlayContainer.peek(container));
    }
  }

  static create(index: number): PlayContainer {
    const container = new PlayContainer();
    container.index = index;
    for (let i = 0; i < CONTAINER_SIZE; i++) {
      container.items.push(itemCreate(undefined, index, false));
    }
    PlayContainer.afterChange(container);
    return container;
  }

  static isResolved(container: PlayContainer): boolean {
    return container.resolved;
  }

  static equals(container1: PlayContainer, container2: PlayContainer): boolean {
    if (PlayContainer.size(container1) !== PlayContainer.size(container2)) {
      return false;
    }
    for (let i = 0; i < PlayContainer.size(container1); i++) {
      if (container1.items[i].color !== container2.items[i].color) {
        return false;
      }
    }
    return true;
  }

  static hasOnlyThreeOfOneColor(container: PlayContainer): boolean {
    return PlayContainer.size(container) === 3 && container.items[0].color === container.items[1].color && container.items[0].color === container.items[2].color;
  }

  static hasOnlyTwoOfOneColor(container: PlayContainer): boolean {
    return PlayContainer.size(container) === 2 && container.items[0].color === container.items[1].color;
  }

  static hasOnlyOneOfOneColor(container: PlayContainer): boolean {
    return PlayContainer.size(container) === 1;
  }

  static hasOnlyOneColor(container: PlayContainer): boolean {
    if (PlayContainer.isEmpty(container)) {
      return false;
    }
    return container.items.every(item => item.color === undefined || item.color === container.items[0].color);
  }

  static containerClone(c: PlayContainer): PlayContainer {
    const newContainer = PlayContainer.create(c.index);
    c.items.forEach((item, index) => newContainer.items[index].color = item.color);
    PlayContainer.afterChange(newContainer);
    return newContainer;
  }

  static containersClone(containers: PlayContainer[]): PlayContainer[] {
    return containers.map(container => PlayContainer.containerClone(container));
  }

}
