import { Injectable } from "@angular/core";
import { Container } from "../classes/container.class";

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  containers: Container[] = [];

  constructor() {
    this.fillBoard();
  }

  private fillBoard() {
    for (let i = 0; i < 14; i++) {
      this.containers.push(this.createContainer(i));
    }
  }

  private createContainer(index: number): Container {
    const container = new Container();

    return container;
  }
}
