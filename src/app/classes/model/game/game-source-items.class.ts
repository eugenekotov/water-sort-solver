import { Color } from "../colors.class";
import { CONTAINER_SIZE } from "../const.class";
import { SourceItem } from "../source-item.class";

export class GameSourceItems {

  sourceItems: SourceItem[] = [];

  public getAvailableSourceItems(): SourceItem[] {
    return this.sourceItems.filter(item => item.count > 0);
  }

  public clear() {
    this.sourceItems.forEach(item => item.count = CONTAINER_SIZE);
  }

  public getSourceItem(color: Color): SourceItem {
    const items = this.sourceItems.filter(item => item.color === color);
    if (items.length !== 1) {
      throw new Error("Cannot find source item by color");
    }
    return items[0];
  }

  public increment(color: Color): void {
    const index = Object.values(Color).indexOf(color);
    this.sourceItems[index].count++;
  }

  public createItems(count: number) {
    const colorValues = Object.values(Color);
    this.sourceItems = [];
    for (let i = 0; i < count; i++) {
      this.sourceItems.push(new SourceItem(colorValues[i]));
    }
  }

  public addItems(count: number) {
    const colorValues = Object.values(Color);
    const indexFrom = this.sourceItems.length
    for (let i = indexFrom; i < indexFrom + count; i++) {
      this.sourceItems.push(new SourceItem(colorValues[i]));
    }
  }

  public popItem(): SourceItem {
    if (this.sourceItems.length === 0) {
      throw new Error("Source item doesn't have color");
    }
    return this.sourceItems.pop()!;
  }

}
