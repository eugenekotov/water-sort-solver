import { Board } from "../model/board/board.class";
import { Color } from "../model/colors.class";
import { GameContainer } from "../model/game/game-container.class";
import { LogicResult, makeStep, TLogicFunction } from "./logic-controller.interface";

export function getLogic1To3(): TLogicFunction {
  return (board: Board) => {
    const result = new LogicResult();
    let hasStep = true;
    while (hasStep) {
      hasStep = false;
      for (let iTo = 0; iTo < board.gameContainers.length; iTo++) {
        if (GameContainer.hasOnlyThreeOfOneColor(board.gameContainers[iTo])) {
          const iFrom = getColorContainerIndex(board, board.gameContainers[iTo].colors[0], iTo);
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
    for (let i = 0; i < board.gameContainers.length; i++) {
      if (i !== excludeIndex && !GameContainer.isEmpty(board.gameContainers[i]) && GameContainer.peek(board.gameContainers[i]) === color) {
        return i;
      }
    }
    return -1;
  }

}
