import { Board } from "./board.class";

export class BoardsSet {

  private boards: Board[] = [];

  clear() {
    this.boards = [];
  }

  contains(board: Board): boolean {
    return this.boards.some(existsBoard => existsBoard.equals(board));
  }

  add(board: Board): void {
    if (!this.contains(board)) {
      this.boards.push(board);
    }
  }

}
