import { Board } from "./board.class";

export function boardSetContains(boardSet: Board[], board: Board): boolean {
  return boardSet.some(existsBoard => Board.equal(existsBoard, board));
}

export function boardSetAdd(boardSet: Board[], board: Board): void;
export function boardSetAdd(boardSet1: Board[], boardSet2: Board[]): void;
export function boardSetAdd(boardSet: Board[], value: Board | Board[]): void {
  // console.log("add to oldboards, size = " + this.boards.length);
  if (value instanceof Board) {
    if (!boardSetContains(boardSet, value)) {
      boardSet.push(value);
      // console.log("added");
    } else {
      // console.log("skipped");
    }
  } else {
    boardSet = [...boardSet, ...value];
  }
}


