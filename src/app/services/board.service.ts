import { Injectable } from "@angular/core";
import { Container } from "../classes/container.class";
import { Color } from "../classes/colors.class";
import { Item } from "../classes/item.class";

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  public readonly CONTAINER_BORDER_WIDTH = '0.1rem';
  public readonly ITEM_SIZE = '2rem';

  containers: Container[] = [];
  item: Item;

  constructor() {
    this.fillBoard();
    this.item = new Item();
    this.item.color = Color.RED;
    this.item.containerIndex = 9;
    this.item.hidden = false;
  }

  private fillBoard() {
    for (let i = 0; i < 12; i++) {
      this.containers.push(this.createContainer(i));
    }
    this.containers.push(new Container());
    this.containers.push(new Container());
  }

  private createContainer(index: number): Container {
    const container = new Container();
    // Add colors
    // container.push(Color.BLUE);
    // container.push(Color.BROWN);
    // container.push(Color.RED);
    // if (index % 2 === 0) {
    //   container.push(Color.YELLOW);
    // }
    // Add items
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
