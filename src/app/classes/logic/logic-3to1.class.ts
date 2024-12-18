import { Board } from "../model/board.class";
import { Color } from "../model/colors.class";
import { Step } from "../solution.class";
import { ILogicController, LogicResult, makeStep } from "./logic-controller.interface";

export class Logic3To1 implements ILogicController {

  run(board: Board): LogicResult {
    const result = new LogicResult();
    let hasStep = true;
    while (hasStep) {
      hasStep = false;
      for (let iTo = 0; iTo < board.containers.length; iTo++) {
        if (board.containers[iTo].hasOnlyOneOfOneColor()) {
          const iFrom = this.getColorThreeContainerIndex(board, board.containers[iTo].items[0].color!, iTo);
          if (iFrom !== -1) {
            board = makeStep(board, iFrom, iTo, 3, result);
            hasStep = true;
            break;
          }
        }
      }
    }
    console.log("Logic 3 to 1 made " + result.stepCount + " steps.");
    return result;
  }

  private getColorThreeContainerIndex(board: Board, color: Color, excludeIndex: number): number {
    for (let i = 0; i < board.containers.length; i++) {
      if (i !== excludeIndex && board.containers[i].size() == 4
          && board.containers[i].items[board.containers[i].size() - 1].color === color
          && board.containers[i].items[board.containers[i].size() - 2].color === color
          && board.containers[i].items[board.containers[i].size() - 3].color === color) {
        return i;
      }
    }
    return -1;
  }

}
