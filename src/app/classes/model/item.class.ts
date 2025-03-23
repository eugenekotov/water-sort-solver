import { Color } from "./colors.class";

export class Item {
  color: Color | undefined;
  hidden: boolean = true;
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

export class Position {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class MovingItem extends Item {
  top: string | undefined;
  left: string | undefined;
  transitionDuration: string | undefined;
  private _position: Position;

  set position(position: Position) {
    this._position = position;
    this.top = `${position.y}px`;
    this.left = `${position.x}px`;
  }

  get position(): Position {
    return this._position;
  }

}
