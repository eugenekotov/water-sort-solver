import { Injectable } from "@angular/core";
import { Container } from "../classes/container.class";
import { Color } from "../classes/colors.class";
import { Item } from "../classes/item.class";
import { of } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  private readonly CONTAINER_COUNT = 14;

  containers: Container[] = [];
  movingItem: Item; // Item for moving animation

  constructor() {
    this.fillBoard();
    this.movingItem = new Item();
    this.movingItem.color = Color.RED;
    this.movingItem.containerIndex = 9;
    this.movingItem.hidden = false;
  }

  private fillBoard() {
    for (let i = 0; i < this.CONTAINER_COUNT; i++) {
      this.containers.push(new Container());
    }
  }

  private createContainer(index: number): Container {
    const container = new Container();
    const item1 = new Item();
    item1.color = Color.DARK_BLUE;
    item1.containerIndex = index;
    item1.hidden = false;
    item1.index = 0;
    container.items.push(item1);
    const item2 = new Item();
    item2.color = Color.DARK_GREEN;
    item2.containerIndex = index;
    item2.hidden = false;
    item2.index = 1;
    container.items.push(item2);
    //
    return container;
  }
}
