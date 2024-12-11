import { Color } from "./model/colors.class";

export class Item {

  color: Color | undefined;
  containerIndex: number;
  hidden: boolean;
  top: string;
  left: string;

  constructor(color: Color | undefined, containerIndex: number, hidden: boolean) {
    this.color = color;
    this.containerIndex = containerIndex;
    this.hidden = hidden;
  }

}
