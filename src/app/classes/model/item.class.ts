import { Color } from "./colors.class";

export class Item {

  color: Color | undefined;
  containerIndex: number;
  hidden: boolean;
  top: string | undefined;
  left: string | undefined;
  transitionDuration: string | undefined;

}

export function itemCreate(color: Color | undefined, containerIndex: number, hidden: boolean): Item {
  const item = new Item();
  item.color = color;
  item.containerIndex = containerIndex;
  item.hidden = hidden;

  return item;

}
