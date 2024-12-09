import { Color } from "./model/colors.class";

export class Item {

  color: Color | undefined;
  containerIndex: number;
  itemIndex: number;
  hidden: boolean;

  constructor(color: Color | undefined, containerIndex: number, itemIndex: number, hidden: boolean) {
    this.color = color;
    this.containerIndex = containerIndex;
    this.itemIndex = itemIndex;
    this.hidden = hidden;
  }

}
