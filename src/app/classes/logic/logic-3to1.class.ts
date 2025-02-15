import { BoardContainer } from "../model/board/board-container.class";
import { Board } from "../model/board/board.class";
import { Color } from "../model/colors.class";
import { LogicResult, makeStep, TLogicFunction } from "./logic-controller.interface";

export function getLogic3To1(): TLogicFunction {

  return (board: Board) => {
    const result = new LogicResult();
    let hasStep = true;
    while (hasStep) {
      hasStep = false;
      for (let iTo = 0; iTo < board.containers.length; iTo++) {
        if (BoardContainer.hasOnlyOneOfOneColor(board.boardContainers[iTo])) {
          const iFrom = getColorThreeContainerIndex(board, board.containers[iTo].items[0].color!, iTo);
          if (iFrom !== -1) {
            board = makeStep(board, iFrom, iTo, 3, result);
            hasStep = true;
            break;
          }
        }
      }
    }
    // console.log("Logic 3 to 1 made " + result.stepCount + " steps.");
    return result;
  }

  function getColorThreeContainerIndex(board: Board, color: Color, excludeIndex: number): number {
    for (let i = 0; i < board.containers.length; i++) {
      if (i !== excludeIndex && BoardContainer.size(board.boardContainers[i]) == 4
        && board.containers[i].items[BoardContainer.size(board.boardContainers[i]) - 1].color === color
        && board.containers[i].items[BoardContainer.size(board.boardContainers[i]) - 2].color === color
        && board.containers[i].items[BoardContainer.size(board.boardContainers[i]) - 3].color === color) {
        return i;
      }
    }
    return -1;
  }

}
