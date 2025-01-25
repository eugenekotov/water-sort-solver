import { Color } from "./colors.class";
import { CONTAINER_SIZE } from "./const.class";

export class Item {
  color: Color | undefined;
  hidden: boolean;
}

export class PlayItem extends Item {
  containerIndex: number;

  static create(color: Color | undefined, containerIndex: number, hidden: boolean): PlayItem {
    const item = new PlayItem();
    item.color = color;
    item.containerIndex = containerIndex;
    item.hidden = hidden;
    return item;
  }
}

export class MovingItem extends Item {
  top: string | undefined;
  left: string | undefined;
  transitionDuration: string | undefined;
}

export class SourceItem extends Item {
  count: number;
  selected: boolean = false;

  constructor(color: Color) {
    super();
    this.color = color;
    this.count = CONTAINER_SIZE;
  }
}
