import { Injectable } from "@angular/core";
import { Container } from "../classes/container.class";
import { Color } from "../classes/model/colors.class";
import { Item } from "../classes/item.class";

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  private readonly CONTAINER_COUNT = 14;
  public readonly TRANSITION_DURATION_MS = 1000;
  public readonly TRANSITION_DURATION = (this.TRANSITION_DURATION_MS / 2000).toString() + "s";

  containers: Container[] = [];
  movingItem: Item; // Item for moving animation

  constructor() {
    this.fillBoard();
    this.movingItem = new Item(undefined, 0, true);
  }

  private fillBoard() {
    for (let i = 0; i < this.CONTAINER_COUNT; i++) {
      this.containers.push(new Container(i));
    }

    // this.containers[0].push(Color.RED);
    // this.containers[0].push(Color.LIGHT_GREEN);
    // this.containers[0].push(Color.VIOLET);
    // this.containers[0].push(Color.BROWN);

    // this.containers[1].push(Color.PINK);
    // this.containers[1].push(Color.DARK_BLUE);
    // this.containers[1].push(Color.GREY);
    // this.containers[1].push(Color.GREEN);

    // this.containers[2].push(Color.PINK);
    // this.containers[2].push(Color.GREY);
    // this.containers[2].push(Color.GREEN);

    // this.containers[3].push(Color.RED);
    // this.containers[3].push(Color.BROWN);
    // this.containers[3].push(Color.GREEN);
    // this.containers[3].push(Color.YELLOW);

    // this.containers[4].push(Color.YELLOW);
    // this.containers[4].push(Color.GREEN);
    // this.containers[4].push(Color.YELLOW);

    // this.containers[5].push(Color.YELLOW);
    // this.containers[5].push(Color.LIGHT_GREEN);
    // this.containers[5].push(Color.VIOLET);
    // this.containers[5].push(Color.BROWN);

    // this.containers[6].push(Color.RED);
    // this.containers[6].push(Color.BROWN);
    // this.containers[6].push(Color.VIOLET);

    // this.containers[7].push(Color.BROWN);
    // this.containers[7].push(Color.VIOLET);
    // this.containers[7].push(Color.RED);

    // this.containers[8].push(Color.BROWN);
    // this.containers[8].push(Color.VIOLET);
    // this.containers[8].push(Color.RED);

    // this.containers[9].push(Color.BROWN);
    // this.containers[9].push(Color.VIOLET);
    // this.containers[9].push(Color.RED);

    // this.containers[10].push(Color.BROWN);
    // this.containers[10].push(Color.VIOLET);

    // this.containers[11].push(Color.VIOLET);
    // this.containers[11].push(Color.VIOLET);
    // this.containers[11].push(Color.RED);

  }

}
