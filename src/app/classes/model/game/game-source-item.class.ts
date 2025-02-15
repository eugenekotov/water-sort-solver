import { Color } from "../colors.class";
import { CONTAINER_SIZE } from "../const.class";

export class GameSourceItem {
  color: Color;
  count: number;

  constructor(color: Color) {
    this.color = color;
    this.count = CONTAINER_SIZE;
  }
}
