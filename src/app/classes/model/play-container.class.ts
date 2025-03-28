import { Color } from "./colors.class";
import { CONTAINER_SIZE } from "./const.class";
import { PlayItem } from "./item.class";


/**
 * static methods added to use them from web-worker
 */
export class PlayContainer {

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
  items: PlayItem[] = [];

  constructor(index: number) {
    this.index = index;
    for (let i = 0; i < CONTAINER_SIZE; i++) {
      this.items.push(PlayItem.create(undefined, index, false));
    }
    this.afterChange();
  }

  getTopColorCount(): number {
    if (this.isEmpty()) {
      return 0;
    }
    let result = 1;
    const color = this.peek();
    let i = this.size() - 2;
    while (i >= 0 && this.items[i].color === color) {
      result++;
      i--;
    }
    return result
  }

  peek(): Color {
    const size = this.size();
    if (size == 0) {
      console.error("Container is empty.");
    }
    return this.items[size - 1].color!;
  }

  size(): number {
    return this._size;
  }

  pop(): Color {
    const size = this.size();
    if (size == 0) {
      console.error("Container is empty.");
    }
    const color = this.items[size - 1].color!;
    this.items[size - 1].color = undefined;
    this.afterChange();
    return color;
  }

  push(color: Color): void {
    this.items[this.size()].color = color;
    this.afterChange();
  }

  isEmpty(): boolean {
    return this.items[0].color === undefined;
  }

  isFull(): boolean {
    return this.size() === CONTAINER_SIZE;
  }

  private afterChange() {
    this.calculateSize();
  }

  private calculateSize() {
    this._size = this.items.findIndex(item => item.color === undefined);
    if (this._size === -1) {
      this._size = CONTAINER_SIZE;
    }
  }

}
