import { Board } from "../model/board.class";
import { BoardsSet } from "../model/boards-set.class";
import { Step } from "../solution.class";

export class LogicResult {
  board: Board;
  stepCount: number = 0;
  oldBoards: BoardsSet = new BoardsSet();
  steps: Step[] = [];
}

export interface ILogicController {

  run(board: Board): LogicResult;

}

export function makeStep(board: Board, iFrom: number, iTo: number, result: LogicResult): Board {
  board = board.clone();
  board.containers[iTo].push(board.containers[iFrom].pop());
  result.board = board;
  result.stepCount++;
  result.oldBoards.add(board);
  result.steps.push(new Step(board.containers[iFrom].index, board.containers[iTo].index));
  return board;
}


