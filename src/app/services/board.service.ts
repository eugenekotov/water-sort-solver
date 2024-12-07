import { Injectable } from "@angular/core";
import { Container } from "../classes/container.class";
import { Color } from "../classes/colors.class";

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  containers: Container[] = [];

  constructor() {
    this.fillBoard();
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
    container.push(Color.BLUE);
    container.push(Color.BROWN);
    container.push(Color.RED);
    if (index % 2 === 0) {
      container.push(Color.YELLOW);
    }
    return container;
  }
}
