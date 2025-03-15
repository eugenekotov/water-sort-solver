import { Color } from "../colors.class";
import { CONTAINER_SIZE } from "../const.class";
import { GameSourceItem } from "./game-source-item.class";

export class GameSourceItems {

  items: GameSourceItem[] = [];

  public getAvailableSourceItems(): GameSourceItem[] {
    return this.items.filter(item => item.count > 0);
  }

  public clear() {
    this.items.forEach(item => item.count = CONTAINER_SIZE);
  }

  public getSourceItem(color: Color): GameSourceItem {
    const items = this.items.filter(item => item.color === color);
    if (items.length !== 1) {
      throw new Error("Cannot find source item by color");
    }
    return items[0];
  }

  public increment(color: Color): void {
    const index = Object.values(Color).indexOf(color);
    this.items[index].count++;
  }

  public createItems(count: number) {
    const colorValues = Object.values(Color);
    this.items = [];
    for (let i = 0; i < count; i++) {
      this.items.push(new GameSourceItem(colorValues[i]));
    }
  }

  public addItems(count: number) {
    const colorValues = Object.values(Color);
    const indexFrom = this.items.length
    for (let i = indexFrom; i < indexFrom + count; i++) {
      this.items.push(new GameSourceItem(colorValues[i]));
    }
  }

  public popItem(): GameSourceItem {
    if (this.items.length === 0) {
      throw new Error("Source item doesn't have color");
    }
    return this.items.pop()!;
  }

}
