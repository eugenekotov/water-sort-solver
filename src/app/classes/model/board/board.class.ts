import { GameContainer } from "../game/game-container.class";

export class Board {

  gameContainers: GameContainer[] = [];

  static create(containers: GameContainer[]): Board {
    const board = new Board();
    board.gameContainers = containers.map((container, index) => ({ colors: container.colors, resolved: false, index: index }));
    return board;
  }

  static isResolved(board: Board): boolean {
    let result = true;
    let i = 0;
    while (i < board.gameContainers.length) {
      let container = board.gameContainers[i];
      if (container.colors.length === 0) {
        i++;
      } else if (container.resolved) {
        board.gameContainers.splice(i, 1);
      } else {
        result = false;
        i++;

      }
    }
    return result;
  }

  static clone(board: Board): Board {
    const newBoard = new Board();
    newBoard.gameContainers = board.gameContainers.map(container => GameContainer.clone(container));
    return newBoard;
  }

  static equal(board1: Board, board2: Board): boolean {
    if (board1.gameContainers.length !== board2.gameContainers.length) {
      return false;
    }
    for (let i = 0; i < board1.gameContainers.length; i++) {
      const count1 = Board.getContainerCount(board2, board1.gameContainers[i]);
      const count2 = Board.getContainerCount(board1, board1.gameContainers[i]);
      if (count1 !== count2) {
        return false;
      }
    }
    return true;
  }

  static getContainerCount(board: Board, container: GameContainer): number {
    return board.gameContainers.filter(boardContainer => GameContainer.equal(boardContainer, container)).length;
  }

}



