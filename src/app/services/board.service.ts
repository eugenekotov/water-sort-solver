import { Injectable } from "@angular/core";
import { Container } from "../classes/container.class";
import { Color } from "../classes/model/colors.class";
import { Item } from "../classes/item.class";
import { of } from "rxjs";
import { MovingItem } from "../classes/moving-item.class";

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  private readonly CONTAINER_COUNT = 14;

  containers: Container[] = [];
  movingItem: MovingItem; // Item for moving animation

  constructor() {
    this.fillBoard();

    this.movingItem = new MovingItem();
    this.movingItem.color = Color.RED;
    this.movingItem.containerIndex = 9;
    this.movingItem.hidden = true;
  }

  private fillBoard() {
    for (let i = 0; i < this.CONTAINER_COUNT; i++) {
      this.containers.push(new Container(i));
    }

    this.containers[5].push(Color.YELLOW);
    this.containers[5].push(Color.LIGHT_GREEN);
    this.containers[5].push(Color.VIOLET);
    this.containers[5].push(Color.BROWN);
  }

}
