import { Board } from "../model/board.class";
import { Color } from "../model/colors.class";
import { Step } from "../solution.class";
import { ILogicController, LogicResult, makeStep } from "./logic-controller.interface";

export class Logic2To2 implements ILogicController {

  run(board: Board): LogicResult {
    const result = new LogicResult();
    let hasStep = true;
    while (hasStep) {
      hasStep = false;
      for (let iTo = 0; iTo < board.containers.length; iTo++) {
        if (board.containers[iTo].hasOnlyTwoOfOneColor()) {
          const iFrom = this.getColorTwoContainerIndex(board, board.containers[iTo].items[0].color!, iTo);
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

  private getColorTwoContainerIndex(board: Board, color: Color, excludeIndex: number): number {
    for (let i = 0; i < board.containers.length; i++) {
      if (i !== excludeIndex && board.containers[i].size() > 1
          && board.containers[i].items[board.containers[i].size() - 1].color === color
          && board.containers[i].items[board.containers[i].size() - 2].color === color) {
        return i;
      }
    }
    return -1;
  }

}
