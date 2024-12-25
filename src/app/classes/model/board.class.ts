import { PlayContainer } from "./play-container.class";

export class Board {

  containers: PlayContainer[] = [];

  constructor();
  constructor(containers: PlayContainer[]);
  constructor(containers?: PlayContainer[]) {
    if (containers !== undefined) {
      this.containers = containers;
      this.containers.forEach(container => container.afterChange());
    }
  }

  public isResolved(): boolean {
    let result = true;
    let i = 0;
    while (i < this.containers.length) {
      let container = this.containers[i];
      if (container.isEmpty()) {
        i++;
      } else if (container.isResolved()) {
        this.containers.splice(i, 1);
      } else {
        result = false;
        i++;
      }
    }
    return result;
  }

  public clone(): Board {
    const board = new Board();
    board.containers = this.containers.map(container => container.clone());
    return board;
  }

  public equals(board: Board): boolean {
    if (this.containers.length !== board.containers.length) {
      return false;
    }
    for (let i = 0; i < this.containers.length; i++) {
      const count1 = board.getContainerCount(this.containers[i]);
      const count2 = this.getContainerCount(this.containers[i]);
      if (count1 !== count2) {
        return false;
      }
    }
    return true;
  }

  public getContainerCount(container2: PlayContainer): number {
    return this.containers.filter(container1 => container1.equals(container2)).length;
  }

}
