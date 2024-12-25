import { Board } from "../model/board.class";
import { Color } from "../model/colors.class";
import { ILogicController, LogicResult, makeStep } from "./logic-controller.interface";

export class Logic1To3 implements ILogicController {

  run(board: Board): LogicResult {
    const result = new LogicResult();
    let hasStep = true;
    while (hasStep) {
      hasStep = false;
      for (let iTo = 0; iTo < board.containers.length; iTo++) {
        if (board.containers[iTo].hasOnlyThreeOfOneColor()) {
          const iFrom = this.getColorContainerIndex(board, board.containers[iTo].items[0].color!, iTo);
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

  private getColorContainerIndex(board: Board, color: Color, excludeIndex: number): number {
    for (let i = 0; i < board.containers.length; i++) {
      if (i !== excludeIndex && !board.containers[i].isEmpty() && board.containers[i].peek() === color) {
        return i;
      }
    }
    return -1;
  }

}
