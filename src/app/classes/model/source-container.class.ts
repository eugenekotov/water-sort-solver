import { Color } from "./colors.class";
import { PlayContainer } from "./play-container.class";

export class SourceContainer {
  color: Color;
  count: number;
  selected: boolean = false;

  constructor(color: Color) {
    this.color = color;
    this.count = PlayContainer.MAX_SIZE;
  }
}
