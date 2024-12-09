import { Color } from "./colors.class";
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

  items: Item[] = [];

  constructor() {
    this.afterChange();
  }

  private afterChange() {

  }

  // public push(color: Color): void {
  //   this.colors.push(color);
  //   this.afterChange();
  // }

  // public pop(): Color {
  //   const result = this.colors.pop()!;
  //   this.afterChange();
  //   return result;
  // }
}
