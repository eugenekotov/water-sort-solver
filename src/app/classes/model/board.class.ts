import { containerAfterChange, containerClone, containerEquals, containerIsEmpty, containerIsResolved, PlayContainer } from "./play-container.class";

export class Board {

  containers: PlayContainer[] = [];

}

export function boardCreate(): Board;
export function boardCreate(containers: PlayContainer[]): Board;
export function boardCreate(containers?: PlayContainer[]): Board {
  const board = new Board();
  if (containers !== undefined) {
    board.containers = containers;
    board.containers.forEach(container => containerAfterChange(container));
  }
  return board;
}

export function boardIsResolved(board: Board): boolean {
  let result = true;
  let i = 0;
  while (i < board.containers.length) {
    let container = board.containers[i];
    if (containerIsEmpty(container)) {
      i++;
    } else if (containerIsResolved(container)) {
      board.containers.splice(i, 1);
    } else {
      result = false;
      i++;
    }
  }
  return result;
}

export function boardClone(board: Board): Board {
  const newBoard = new Board();
  newBoard.containers = board.containers.map(container => containerClone(container));
  return newBoard;
}

export function boardEquals(board1: Board, board2: Board): boolean {
  if (board1.containers.length !== board2.containers.length) {
    return false;
  }
  for (let i = 0; i < board1.containers.length; i++) {
    const count1 = boardGetContainerCount(board2, board1.containers[i]);
    const count2 = boardGetContainerCount(board1, board1.containers[i]);
    if (count1 !== count2) {
      return false;
    }
  }
  return true;
}

export function boardGetContainerCount(board: Board, container2: PlayContainer): number {
  return board.containers.filter(container1 => containerEquals(container1, container2)).length;
}
