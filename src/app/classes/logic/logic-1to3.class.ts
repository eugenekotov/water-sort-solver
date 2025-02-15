import { Board } from "../model/board.class";
import { Color } from "../model/colors.class";
import { PlayContainer } from "../model/play-container.class";
import { LogicResult, makeStep, TLogicFunction } from "./logic-controller.interface";

export function getLogic1To3(): TLogicFunction {
  return (board: Board) => {
    const result = new LogicResult();
    let hasStep = true;
    while (hasStep) {
      hasStep = false;
      for (let iTo = 0; iTo < board.containers.length; iTo++) {
        if (PlayContainer.hasOnlyThreeOfOneColor(board.containers[iTo])) {
          const iFrom = getColorContainerIndex(board, board.containers[iTo].items[0].color!, iTo);
          if (iFrom !== -1) {
            board = makeStep(board, iFrom, iTo, 1, result);
            hasStep = true;
            break;
          }
        }
      }
    }
    // console.log("Logic 1 to 3 made " + result.stepCount + " steps.");
    return result;
  }

  function getColorContainerIndex(board: Board, color: Color, excludeIndex: number): number {
    for (let i = 0; i < board.containers.length; i++) {
      if (i !== excludeIndex && !PlayContainer.isEmpty(board.containers[i]) && PlayContainer.peek(board.containers[i]) === color) {
        return i;
      }
    }
    return -1;
  }

}
