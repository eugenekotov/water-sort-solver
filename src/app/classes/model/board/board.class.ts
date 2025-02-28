import { GameContainer } from "../game/game-container.class";
import { BoardContainer } from "./board-container.class";

export class Board {

  boardContainers: BoardContainer[] = [];

  static create(containers: GameContainer[]): Board {
    const board = new Board();
    board.boardContainers = containers.map((container, index) => ({ gameContainer: container, resolved: false, index: index }));
    return board;
  }

  static isResolved(board: Board): boolean {
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

  static clone(board: Board): Board {
    const newBoard = new Board();
    newBoard.boardContainers = board.boardContainers.map(container => BoardContainer.clone(container));
    return newBoard;
  }

  static equal(board1: Board, board2: Board): boolean {
    if (board1.boardContainers.length !== board2.boardContainers.length) {
      return false;
    }
    for (let i = 0; i < board1.boardContainers.length; i++) {
      const count1 = Board.getContainerCount(board2, board1.boardContainers[i]);
      const count2 = Board.getContainerCount(board1, board1.boardContainers[i]);
      if (count1 !== count2) {
        return false;
      }
    }
    return true;
  }

  static getContainerCount(board: Board, container: BoardContainer): number {
    return board.boardContainers.filter(boardContainer => GameContainer.equal(boardContainer.gameContainer, container.gameContainer)).length;
  }

}



