import { boardSetAdd } from "../model/board/board-set.class";
import { Board, boardClone } from "../model/board/board.class";
import { PlayContainer } from "../model/play-container.class";
import { Step } from "../solution-controller.class";

export class LogicResult {
  board: Board;
  stepCount: number = 0;
  oldBoards: Board[] = [];
  steps: Step[] = [];
}

export type TLogicFunction = (board: Board) => LogicResult;

export function makeStep(board: Board, iFrom: number, iTo: number, stepCount: number, result: LogicResult): Board {
  board = boardClone(board);
  for (let i = 0; i < stepCount; i++) {
    PlayContainer.push(board.containers[iTo], PlayContainer.pop(board.containers[iFrom]));
    result.steps.push(new Step(board.containers[iFrom].index, board.containers[iTo].index, board.containers[iTo].items[PlayContainer.size(board.containers[iTo]) - 1].color!));
  }
  result.board = board;
  result.stepCount = result.stepCount + stepCount;
  boardSetAdd(result.oldBoards, board);

  return board;
}
