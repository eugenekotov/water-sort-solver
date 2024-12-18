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

  // TODO: Needs to check if find similar container, counts of these containers must be equal
  public equals(board: Board): boolean {
    if (this.containers.length !== board.containers.length) {
      return false;
    }
    for (let i = 0; i < this.containers.length; i++) {
      if (!this.contains(board.containers[i])) {
        return false;
      }
      if (!board.contains(this.containers[i])) {
        return false;
      }
    }
    return true;
  }

  public contains(container2: PlayContainer): boolean {
    return this.containers.some(container1 => container1.equals(container2));
  }

}
