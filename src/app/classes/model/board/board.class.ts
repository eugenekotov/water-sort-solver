import { GameContainer } from "../game/game-container.class";
import { PlayContainer } from "../play-container.class";
import { BoardContainer } from "./board-container.class";

export class Board {

  boardContainers: BoardContainer[] = [];
  containers: PlayContainer[] = [];

}

export function boardCreate(containers: PlayContainer[]): Board {
  const board = new Board();
  if (containers !== undefined) {
    board.containers = containers;
    board.containers.forEach(container => PlayContainer.afterChange(container));
  }
  return board;
}

export function boardCreate2(containers: GameContainer[]): Board {
  const board = new Board();
  if (containers !== undefined) {
    board.boardContainers = containers.map((container, index) => ({ gameContainer: container, resolved: false, index: index }));
  }
  return board;
}

export function boardIsResolved(board: Board): boolean {
  let result = true;
  let i = 0;
  while (i < board.containers.length) {
    let container = board.containers[i];
    if (PlayContainer.isEmpty(container)) {
      i++;
    } else if (PlayContainer.isResolved(container)) {
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
  newBoard.containers = board.containers.map(container => PlayContainer.containerClone(container));
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
  return board.containers.filter(container1 => PlayContainer.equals(container1, container2)).length;
}






export function boardIsResolved2(board: Board): boolean {
  let result = true;
  let i = 0;
  while (i < board.boardContainers.length) {
    let container = board.boardContainers[i];
    if (container.gameContainer.colors.length === 0) {
      i++;
    } else if (container.resolved) {
      board.boardContainers.splice(i, 1);
    } else {
      result = false;
      i++;

    }
  }
  return result;
}

export function boardClone2(board: Board): Board {
  const newBoard = new Board();
  newBoard.boardContainers = board.boardContainers.map(container => boardContainerClone2(container));
  return newBoard;
}

export function boardContainerClone2(boardContainer: BoardContainer): BoardContainer {
  const newContainer = new BoardContainer();
  newContainer.gameContainer = new GameContainer();
  newContainer.gameContainer.colors = [...boardContainer.gameContainer.colors];
  newContainer.resolved = boardContainer.resolved;
  newContainer.index = boardContainer.index;
  return newContainer;
}

export function boardEquals2(board1: Board, board2: Board): boolean {
  if (board1.boardContainers.length !== board2.boardContainers.length) {
    return false;
  }
  for (let i = 0; i < board1.boardContainers.length; i++) {
    const count1 = boardGetContainerCount2(board2, board1.boardContainers[i]);
    const count2 = boardGetContainerCount2(board1, board1.boardContainers[i]);
    if (count1 !== count2) {
      return false;
    }
  }
  return true;
}

export function boardGetContainerCount2(board: Board, container2: BoardContainer): number {
  return board.boardContainers.filter(container1 => GameContainer.equal(container1.gameContainer, container2.gameContainer)).length;
}
