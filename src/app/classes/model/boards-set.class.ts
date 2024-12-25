import { Board } from "./board.class";

export class BoardsSet {

  private boards: Board[] = [];

  clear() {
    this.boards = [];
  }

  contains(board: Board): boolean {
    return this.boards.some(existsBoard => existsBoard.equals(board));
  }

  add(board: Board): void;
  add(boardSet: BoardsSet): void;
  add(value: Board | BoardsSet): void {
    // console.log("add to oldboards, size = " + this.boards.length);
    if (value instanceof Board) {
      if (!this.contains(value)) {
        this.boards.push(value);
        // console.log("added");
      } else {
        // console.log("skipped");
      }
    } else if (value instanceof BoardsSet) {
      this.boards = [...this.boards, ...value.boards];
    } else  {
      const n: never = value;
    }
  }

}
