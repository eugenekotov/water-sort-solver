import { Board } from "../model/board/board.class";
import { Color } from "../model/colors.class";
import { GameContainer } from "../model/game/game-container.class";
import { LogicResult, makeStep, TLogicFunction } from "./logic-controller.interface";

export function getLogic3To1(): TLogicFunction {

  return (board: Board) => {
    const result = new LogicResult();
    let hasStep = true;
    while (hasStep) {
      hasStep = false;
      for (let iTo = 0; iTo < board.gameContainers.length; iTo++) {
        if (GameContainer.hasOnlyOneOfOneColor(board.gameContainers[iTo])) {
          const iFrom = getColorThreeContainerIndex(board, board.gameContainers[iTo].colors[0], iTo);
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
    for (let i = 0; i < board.gameContainers.length; i++) {
      if (i !== excludeIndex && GameContainer.size(board.gameContainers[i]) == 4
        && board.gameContainers[i].colors[GameContainer.size(board.gameContainers[i]) - 1] === color
        && board.gameContainers[i].colors[GameContainer.size(board.gameContainers[i]) - 2] === color
        && board.gameContainers[i].colors[GameContainer.size(board.gameContainers[i]) - 3] === color) {
        return i;
      }
    }
    return -1;
  }

}
