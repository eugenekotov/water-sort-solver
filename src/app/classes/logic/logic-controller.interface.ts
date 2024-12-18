import { Board } from "../model/board.class";
import { Step } from "../solution.class";

export class LogicResult {
  board: Board;
  stepCount: number;
  private oldBoards: Board[] = [];
  steps: Step[] = [];
}

export interface ILogicController {

}
