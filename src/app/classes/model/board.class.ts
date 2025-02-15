import { GameContainer } from "../game.class";
import { Color } from "./colors.class";
import { CONTAINER_SIZE } from "./const.class";


export class BoardContainer {

  gameContainer: GameContainer;
  resolved: boolean = false;
  index: number;

  static checkRsolved(container: BoardContainer) {
    container.resolved = BoardContainer.isFull(container) && BoardContainer.hasOnlyOneColor(container);
  }

  static size(container: BoardContainer): number {
    return container.gameContainer.colors.length;
  }

  static isEmpty(container: BoardContainer): boolean {
    return BoardContainer.size(container) === 0;
  }

  static isFull(container: BoardContainer): boolean {
    return BoardContainer.size(container) === CONTAINER_SIZE;
  }

  static peek(container: BoardContainer): Color {
    return container.gameContainer.colors[container.gameContainer.colors.length - 1];
  }

  static push(container: BoardContainer, color: Color): void {
    container.gameContainer.colors.push(color);
    BoardContainer.checkRsolved(container);
  }

  static pop(container: BoardContainer): Color {
    container.resolved = false;
    const color = container.gameContainer.colors.pop();
    if (!color) {
      throw new Error("Cannot pop color from empty container");
    }
    return color;
  }

  static hasOnlyThreeOfOneColor(container: BoardContainer): boolean {
    return BoardContainer.size(container) === 3
      && container.gameContainer.colors[0] === container.gameContainer.colors[1]
      && container.gameContainer.colors[0] === container.gameContainer.colors[2];
  }

  static hasOnlyTwoOfOneColor(container: BoardContainer): boolean {
    return BoardContainer.size(container) === 2 && container.gameContainer.colors[0] === container.gameContainer.colors[1];
  }

  static hasOnlyOneOfOneColor(container: BoardContainer): boolean {
    return BoardContainer.size(container) === 1;
  }

  static hasOnlyOneColor(container: BoardContainer): boolean {
    if (BoardContainer.isEmpty(container)) {
      return false;
    }
    return container.gameContainer.colors.every(color => color === container.gameContainer.colors[0]);
  }


}

export class Board {
  boardContainers: BoardContainer[] = [];
}

export function boardCreate(containers: GameContainer[]): Board {
  const board = new Board();
  if (containers !== undefined) {
    board.boardContainers = containers.map((container, index) => ({ gameContainer: container, resolved: false, index: index }));
  }
  return board;
}

export function boardIsResolved(board: Board): boolean {
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

export function boardClone(board: Board): Board {
  const newBoard = new Board();
  newBoard.boardContainers = board.boardContainers.map(container => boardContainerClone(container));
  return newBoard;
}

export function boardContainerClone(boardContainer: BoardContainer): BoardContainer {
  const newContainer = new BoardContainer();
  newContainer.gameContainer = new GameContainer();
  newContainer.gameContainer.colors = [...boardContainer.gameContainer.colors];
  newContainer.resolved = boardContainer.resolved;
  newContainer.index = boardContainer.index;
  return newContainer;
}

export function boardEquals(board1: Board, board2: Board): boolean {
  if (board1.boardContainers.length !== board2.boardContainers.length) {
    return false;
  }
  for (let i = 0; i < board1.boardContainers.length; i++) {
    const count1 = boardGetContainerCount(board2, board1.boardContainers[i]);
    const count2 = boardGetContainerCount(board1, board1.boardContainers[i]);
    if (count1 !== count2) {
      return false;
    }
  }
  return true;
}

export function boardGetContainerCount(board: Board, container2: BoardContainer): number {
  return board.boardContainers.filter(container1 => GameContainer.equal(container1.gameContainer, container2.gameContainer)).length;
}
