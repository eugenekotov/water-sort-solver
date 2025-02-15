import { Board } from "../model/board/board.class";
import { Color } from "../model/colors.class";
import { PlayContainer } from "../model/play-container.class";
import { LogicResult, makeStep, TLogicFunction } from "./logic-controller.interface";

export function getLogic3To1(): TLogicFunction {

  return (board: Board) => {
    const result = new LogicResult();
    let hasStep = true;
    while (hasStep) {
      hasStep = false;
      for (let iTo = 0; iTo < board.containers.length; iTo++) {
        if (PlayContainer.hasOnlyOneOfOneColor(board.containers[iTo])) {
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
      if (i !== excludeIndex && PlayContainer.size(board.containers[i]) == 4
        && board.containers[i].items[PlayContainer.size(board.containers[i]) - 1].color === color
        && board.containers[i].items[PlayContainer.size(board.containers[i]) - 2].color === color
        && board.containers[i].items[PlayContainer.size(board.containers[i]) - 3].color === color) {
        return i;
      }
    }
    return -1;
  }

}
