import { Board } from "../model/board.class";
import { BoardsSet } from "../model/boards-set.class";
import { Step } from "../solution-controller.class";

export class LogicResult {
  board: Board;
  stepCount: number = 0;
  oldBoards: BoardsSet = new BoardsSet();
  steps: Step[] = [];
}

export interface ILogicController {

  run(board: Board): LogicResult;

}

export function makeStep(board: Board, iFrom: number, iTo: number, stepCount: number, result: LogicResult): Board {
  board = board.clone();
  for (let i = 0; i < stepCount; i++) {
    board.containers[iTo].push(board.containers[iFrom].pop());
    result.steps.push(new Step(board.containers[iFrom].index, board.containers[iTo].index, board.containers[iTo].items[board.containers[iTo].size() - 1].color!));
  }
  result.board = board;
  result.stepCount = result.stepCount + stepCount;
  result.oldBoards.add(board);

  return board;
}


