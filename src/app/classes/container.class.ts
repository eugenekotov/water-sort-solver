import { Color } from "./colors.class";

export class Container {

  static readonly MAX_SIZE = 4;
  private resolved = false;

  colors: Color[] = [];

  constructor() {
    this.afterChange();
  }

  private afterChange() {

  }

  public push(color: Color): void {
    this.colors.push(color);
    this.afterChange();
  }

  public pop(): Color {
    const result = this.colors.pop()!;
    this.afterChange();
    return result;
  }
}
