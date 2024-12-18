import { Color } from "./colors.class";
import { Item } from "./item.class";

export class PlayContainer {

  static readonly MAX_SIZE = 4;
  private resolved = false;

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

  private _size: number = 0;
  index: number;
  items: Item[] = [];

  constructor(index: number) {
    this.index = index;
    for (let i = 0; i < PlayContainer.MAX_SIZE; i++) {
      this.items.push(new Item(undefined, index, false));
    }
    this.afterChange();
  }

  public afterChange() {
    this.calculateSize();
    this.checkResolved();
  }

  public push(color: Color): void {
    // Search first empty item
    const size = this.size();
    if (size == PlayContainer.MAX_SIZE) {
      throw Error("Size limit exists.");
    }
    this.items[size].color = color;
    this.afterChange();
  }

  public peek(): Color {
    const size = this.size();
    if (size == 0) {
      throw Error("Container is empty.");
    }
    return this.items[size - 1].color!;
  }

  public pop(): Color {
    const size = this.size();
    if (size == 0) {
      throw Error("Container is empty.");
    }
    const color = this.items[size - 1].color!;
    this.items[size - 1].color = undefined;
    this.afterChange();
    return color;
  }

  public size(): number {
    return this._size;
  }

  private calculateSize() {
    this._size = this.items.findIndex(item => item.color === undefined);
    if (this._size === -1) {
      this._size = PlayContainer.MAX_SIZE;
    }
  }

  public isEmpty(): boolean {
    return this.items[0].color === undefined;
  }

  public isFull(): boolean {
    return this.size() === PlayContainer.MAX_SIZE;
  }

  public clear() {
    this.items.forEach(item => item.color = undefined);
  }

  public isResolved(): boolean {
    return this.resolved;
  }

  private checkResolved(): void {
    if (this.size() !== PlayContainer.MAX_SIZE) {
      this.resolved = false;
    } else {
      this.resolved = this.items.every(item => item.color === this.peek());
    }
  }

  public equals(container: PlayContainer): boolean {
    if (this.size() !== container.size()) {
      return false;
    }
    for (let i = 0; i < this.size(); i++) {
      if (this.items[i].color !== container.items[i].color) {
        return false;
      }
    }
    return true;
  }

  public hasOnlyThreeOfOneColor(): boolean {
    return this.size() === 3 && this.items[0].color === this.items[1].color && this.items[0].color === this.items[2].color;
  }

  public hasOnlyTwoOfOneColor(): boolean {
    return this.size() === 2 && this.items[0].color === this.items[1].color;
  }

  public hasOnlyOneOfOneColor(): boolean {
    return this.size() === 1;
  }


  public hasOnlyOneColor(): boolean {
    if (this.isEmpty()) {
      return false;
    }
    return this.items.every(item => item.color === undefined || item.color === this.items[0].color);
  }

  public clone() {
    const newContainer = new PlayContainer(this.index);
    this.items.forEach((item, index) => newContainer.items[index].color = item.color);
    newContainer.afterChange();
    return newContainer;
  }

}
