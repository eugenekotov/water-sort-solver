import { BoardContainer } from "../model/board/board-container.class";
import { boardSetAdd } from "../model/board/board-set.class";
import { Board } from "../model/board/board.class";
import { Step } from "../solution-controller.class";

export class LogicResult {
  board: Board;
  stepCount: number = 0;
  oldBoards: Board[] = [];
  steps: Step[] = [];
}

export type TLogicFunction = (board: Board) => LogicResult;

export function makeStep(board: Board, iFrom: number, iTo: number, stepCount: number, result: LogicResult): Board {
  board = Board.clone(board);
  for (let i = 0; i < stepCount; i++) {
    BoardContainer.push(board.boardContainers[iTo], BoardContainer.pop(board.boardContainers[iFrom]));
    result.steps.push(new Step(
      board.boardContainers[iFrom].index,
      board.boardContainers[iTo].index,
      BoardContainer.peek(board.boardContainers[iTo])));
  }
  result.board = board;
  result.stepCount = result.stepCount + stepCount;
  boardSetAdd(result.oldBoards, board);

  return board;
}
