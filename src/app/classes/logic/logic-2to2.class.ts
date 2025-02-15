import { Board } from "../model/board/board.class";
import { Color } from "../model/colors.class";
import { PlayContainer } from "../model/play-container.class";
import { LogicResult, makeStep, TLogicFunction } from "./logic-controller.interface";

export function getLogic2To2(): TLogicFunction {

  return (board: Board) => {
    const result = new LogicResult();
    let hasStep = true;
    while (hasStep) {
      hasStep = false;
      for (let iTo = 0; iTo < board.containers.length; iTo++) {
        if (PlayContainer.hasOnlyTwoOfOneColor(board.containers[iTo])) {
          const iFrom = getColorTwoContainerIndex(board, board.containers[iTo].items[0].color!, iTo);
          if (iFrom !== -1) {
            board = makeStep(board, iFrom, iTo, 2, result);
            hasStep = true;
            break;
          }
        }
      }
    }
    // console.log("Logic 2 to 2 made " + result.stepCount + " steps.");
    return result;
  }

  function getColorTwoContainerIndex(board: Board, color: Color, excludeIndex: number): number {
    for (let i = 0; i < board.containers.length; i++) {
      if (i !== excludeIndex && PlayContainer.size(board.containers[i]) > 1
        && board.containers[i].items[PlayContainer.size(board.containers[i]) - 1].color === color
        && board.containers[i].items[PlayContainer.size(board.containers[i]) - 2].color === color) {
        return i;
      }
    }
    return -1;
  }

}
