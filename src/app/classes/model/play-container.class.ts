import { Color } from "./colors.class";
import { Item, itemCreate } from "./item.class";

export class PlayContainer {

  static readonly MAX_SIZE = 4;
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
    if (containerIsEmpty(container)) {
      return 0;
    }
    let result = 1;
    const color = containerPeek(container);
    let i = containerSize(container) - 2;
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
    const size = containerSize(container);
    if (size == 0) {
      throw Error("Container is empty.");
    }
    return container.items[size - 1].color!;
  }

  size(): number {
    return this._size;
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
    containerAfterChange(container);
    return color;
  }

  push(color: Color): void {
    PlayContainer.push(this, color);
  }

  static push(container: PlayContainer, color: Color): void {
    // Search first empty item
    const size = containerSize(container);
    if (size == PlayContainer.MAX_SIZE) {
      throw Error("Size limit exists.");
    }
    container.items[size].color = color;
    containerAfterChange(container);
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
    return containerSize(container) === PlayContainer.MAX_SIZE;
  }

}

export function containerCreate(index: number): PlayContainer {
  const container = new PlayContainer();
  container.index = index;
  for (let i = 0; i < PlayContainer.MAX_SIZE; i++) {
    container.items.push(itemCreate(undefined, index, false));
  }
  containerAfterChange(container);
  return container;
}

export function containerAfterChange(container: PlayContainer) {
  containerCalculateSize(container);
  containerCheckResolved(container);
}

export function containerPush(container: PlayContainer, color: Color): void {
  // Search first empty item
  const size = containerSize(container);
  if (size == PlayContainer.MAX_SIZE) {
    throw Error("Size limit exists.");
  }
  container.items[size].color = color;
  containerAfterChange(container);
}

export function containerPeek(container: PlayContainer): Color {
  const size = containerSize(container);
  if (size == 0) {
    throw Error("Container is empty.");
  }
  return container.items[size - 1].color!;
}

export function containerPop(container: PlayContainer): Color {
  const size = containerSize(container);
  if (size == 0) {
    throw Error("Container is empty.");
  }
  const color = container.items[size - 1].color!;
  container.items[size - 1].color = undefined;
  containerAfterChange(container);
  return color;
}

export function containerSize(container: PlayContainer): number {
  return container._size;
}

function containerCalculateSize(container: PlayContainer) {
  container._size = container.items.findIndex(item => item.color === undefined);
  if (container._size === -1) {
    container._size = PlayContainer.MAX_SIZE;
  }
}

export function containerIsEmpty(container: PlayContainer): boolean {
  return container.items[0].color === undefined;
}

export function containerIsFull(container: PlayContainer): boolean {
  return containerSize(container) === PlayContainer.MAX_SIZE;
}

export function containerClear(container: PlayContainer) {
  container.items.forEach(item => item.color = undefined);
}

export function containerIsResolved(container: PlayContainer): boolean {
  return container.resolved;
}

function containerCheckResolved(container: PlayContainer): void {
  if (containerSize(container) !== PlayContainer.MAX_SIZE) {
    container.resolved = false;
  } else {
    container.resolved = container.items.every(item => item.color === containerPeek(container));
  }
}

export function containerEquals(container1: PlayContainer, container2: PlayContainer): boolean {
  if (containerSize(container1) !== containerSize(container2)) {
    return false;
  }
  for (let i = 0; i < containerSize(container1); i++) {
    if (container1.items[i].color !== container2.items[i].color) {
      return false;
    }
  }
  return true;
}

export function containerHasOnlyThreeOfOneColor(container: PlayContainer): boolean {
  return containerSize(container) === 3 && container.items[0].color === container.items[1].color && container.items[0].color === container.items[2].color;
}

export function containerHasOnlyTwoOfOneColor(container: PlayContainer): boolean {
  return containerSize(container) === 2 && container.items[0].color === container.items[1].color;
}

export function containerHasOnlyOneOfOneColor(container: PlayContainer): boolean {
  return containerSize(container) === 1;
}

export function containerHasOnlyOneColor(container: PlayContainer): boolean {
  if (containerIsEmpty(container)) {
    return false;
  }
  return container.items.every(item => item.color === undefined || item.color === container.items[0].color);
}

export function containerClone(c: PlayContainer): PlayContainer {
  const newContainer = containerCreate(c.index);
  c.items.forEach((item, index) => newContainer.items[index].color = item.color);
  containerAfterChange(newContainer);
  return newContainer;
}

export function containersClone(containers: PlayContainer[]): PlayContainer[] {
  return containers.map(container => containerClone(container));
}
