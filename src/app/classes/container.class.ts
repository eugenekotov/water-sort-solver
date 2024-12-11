import { Color } from "./model/colors.class";
import { Item } from "./item.class";

export class Container {

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

  index: number;
  items: Item[] = [];

  constructor(index: number) {
    this.index = index;
    // for (let i = 0; i < Container.MAX_SIZE; i++) {
    //   this.items.push(new Item(undefined, index, false));
    // }
    this.afterChange();
  }

  private afterChange() {

  }

  public push(color: Color): void {
    // Search first empty item
    const size = this.size();
    if (size == Container.MAX_SIZE) {
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
    return color;
  }

  public size(): number {
    let size = this.items.findIndex(item => item.color === undefined);
    if (size === -1) {
      size = Container.MAX_SIZE;
    }
    return size;
  }

  // public pop(): Color {
  //   const result = this.colors.pop()!;
  //   this.afterChange();
  //   return result;
  // }
}
