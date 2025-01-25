import { Color } from "./colors.class";
import { CONTAINER_SIZE } from "./const.class";

export class SourceContainer {
  color: Color;
  count: number;
  selected: boolean = false;

  constructor(color: Color) {
    this.color = color;
    this.count = CONTAINER_SIZE;
  }
}
