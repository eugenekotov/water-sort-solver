import { Color } from "./colors.class";

export class Item {

  color: Color | undefined;
  containerIndex: number;
  hidden: boolean;
  top: string | undefined;
  left: string | undefined;
  transitionDuration: string | undefined;

  constructor(color: Color | undefined, containerIndex: number, hidden: boolean) {
    this.color = color;
    this.containerIndex = containerIndex;
    this.hidden = hidden;
  }

}
