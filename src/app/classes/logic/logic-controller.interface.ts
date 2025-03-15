import { boardSetAdd } from "../model/board/board-set.class";
import { Board } from "../model/board/board.class";
import { GameContainer } from "../model/game/game-container.class";
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
    GameContainer.push(board.gameContainers[iTo], GameContainer.pop(board.gameContainers[iFrom]));
    result.steps.push(new Step(
      board.gameContainers[iFrom].index,
      board.gameContainers[iTo].index,
      GameContainer.peek(board.gameContainers[iTo])));
  }
  result.board = board;
  result.stepCount = result.stepCount + stepCount;
  boardSetAdd(result.oldBoards, board);

  return board;
}
