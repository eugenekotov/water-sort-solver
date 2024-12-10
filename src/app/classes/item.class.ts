import { Color } from "./model/colors.class";

export class Item {

  color: Color | undefined;
  containerIndex: number;
  hidden: boolean;

  constructor(color: Color | undefined, containerIndex: number, hidden: boolean) {
    this.color = color;
    this.containerIndex = containerIndex;
    this.hidden = hidden;
  }

}
