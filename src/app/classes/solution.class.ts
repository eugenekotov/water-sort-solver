import { Subject } from "rxjs";
import { Board } from "./model/board.class";
import { PlayContainer } from "./model/play-container.class";
import { ILogicController, LogicResult } from "./logic/logic-controller.interface"
import { BoardsSet } from "./model/boards-set.class";
import { Logic1To3 } from "./logic/logic-1to3.class";

export class Step {
  iFrom: number;
  iTo: number;

  constructor(iFrom: number, iTo: number) {
    this.iFrom = iFrom;
    this.iTo = iTo;
  }
}

export class Solution {

  private cancel$ = new Subject<void>();
  private oldBoards: BoardsSet = new BoardsSet();
  steps: Step[] = [];
  counter: number = 0;
  logicControllers: ILogicController[] = [];

  constructor() {
    this.logicControllers.push(new Logic1To3());
  }

  solve(containers: PlayContainer[]): boolean {
    this.oldBoards.clear();
    this.steps = [];
    this.counter = 0;
    const result = this.tryToResolve(new Board(containers).clone(), 0);
    if (result) {
      // this.steps.forEach((step, index) => console.log("Steap " + index + ": " + step.iFrom + " -> " + step.iTo));
      this.optimizeSolution();
    }
    return result;
  }

  private optimizeSolution() {
    let count1 = 0;
    let count2 = 0;
    let i = 0;
    let optimized = true;
    while (optimized) {
      // Optimize case 1 -> 2, 2-> 1
      // this.steps.forEach((step, index) => console.log("Steap " + index + ": " + step.iFrom + " -> " + step.iTo));
      optimized = false;
      i = 0;
      let j = 0;
      while (i < this.steps.length - 1) {
        const checkingStep = this.steps[i];
        let j = i + 1;
        while (j < this.steps.length && (this.steps[i].iFrom !== this.steps[j].iTo || this.steps[i].iTo !== this.steps[j].iFrom)) {
          if (this.steps[i].iFrom === this.steps[j].iFrom || this.steps[i].iFrom === this.steps[j].iTo ||
            this.steps[i].iTo === this.steps[j].iFrom || this.steps[i].iTo === this.steps[j].iTo) {
            break;
          }
          j++;
        }
        if (j < this.steps.length && (this.steps[i].iFrom === this.steps[j].iTo && this.steps[i].iTo === this.steps[j].iFrom)) {
          // found back step, remove both
          this.steps.splice(j, 1);
          this.steps.splice(i, 1);
          optimized = true;
          count1++;
        } else {
          i++;
        }
      }

      // Optimize case 1 -> 2, ..., 2 -> 3 to 1 -> 3
      i = 0;
      while (i < this.steps.length - 1) {
        // try to find second part
        let j = i + 1;
        while (j < this.steps.length && this.steps[i].iTo !== this.steps[j].iFrom) {
          j++;
        }
        if (j < this.steps.length && this.steps[i].iTo === this.steps[j].iFrom) {
          // We found, lets check that these containers was not used
          let k = j - 1;
          let used = false;
          while (i < k) {
            if (this.steps[k].iFrom === this.steps[j].iFrom || this.steps[k].iFrom === this.steps[j].iTo || this.steps[k].iTo === this.steps[j].iFrom || this.steps[k].iTo === this.steps[j].iTo) {
              used = true;
              break;
            }
            k--;

          }
          if (used === false) {
            this.steps[i].iTo = this.steps[j].iTo;
            this.steps.splice(j, 1);
            optimized = true;
            count2++;
          } else {
            i++;
          }
        } else {
          i++;
        }
      }

    }
    console.log("Optimization 1 - " + count1);
    console.log("Optimization 2 - " + count2);
  }

  cancel() {
    this.cancel$.next();
  }

  private tryToResolve(board: Board, stepsCount: number): boolean {
    this.counter++;
    if (board.isResolved()) {
      return true;
    }

    const logcResult = this.tryLogicPatterns(board);
    if (logcResult.stepCount > 0) {
      board = logcResult.board;
      stepsCount = stepsCount + logcResult.stepCount;
      this.oldBoards.add(logcResult.oldBoards);
      this.steps = [...this.steps, ...logcResult.steps];
      if (board.isResolved()) {
        return true;
      }
    }

    // Try to check all options
    for (let iFrom = 0; iFrom < board.containers.length; iFrom++) {
      // Try to find place for each
      for (let iTo = 0; iTo < board.containers.length; iTo++) {
        if (iFrom !== iTo) {
          if (this.tryToMove(board, iFrom, iTo, stepsCount)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private tryLogicPatterns(board: Board): LogicResult {
    const result = new LogicResult();
    let hasStep = true;
    while (hasStep) {
      hasStep = false;
      this.logicControllers.forEach(logicController => {
        const logicResult = logicController.run(board);
        if (logicResult.stepCount > 0) {
          hasStep = true;
          board = logicResult.board;
          result.stepCount = result.stepCount + logicResult.stepCount;
          result.oldBoards.add(logicResult.oldBoards);
          result.steps = [...result.steps, ...logicResult.steps];
        }
      });
    }
    result.board = board;
    return result;
  }

  private tryToMove(board: Board, iFrom: number, iTo: number, stepsCount: number): boolean {
    if (board.containers[iFrom].isEmpty()) {
      // Nothing to take
      return false;
    }
    if (board.containers[iTo].isFull()) {
      // No place to put
      return false;
    }
    if (!board.containers[iTo].isEmpty() && board.containers[iFrom].peek() != board.containers[iTo].peek()) {
      // Not suitable color
      return false;
    }
    if (board.containers[iFrom].size() == 1 && board.containers[iTo].isEmpty()) {
      // Stupid move;
      return false;
    }
    if (board.containers[iFrom].hasOnlyThreeOfOneColor()) {
      // Stupid move;
      return false;
    }
    if (board.containers[iFrom].hasOnlyOneColor() && board.containers[iTo].isEmpty()) {
      // if we have only one color and move to empty container
      // Stupid move;
      return false;
    }


    // We can try to move
    board = this.move(board, iFrom, iTo);
    // console.log("Moved one from " + iFrom + " to " + iTo);
    if (this.oldBoards.contains(board)) {
      // We already tried it
      // console.log("We already tried it!");
      return false;
    }
    this.steps.push(new Step(board.containers[iFrom].index, board.containers[iTo].index));
    this.oldBoards.add(board);
    const result = this.tryToResolve(board, stepsCount + 1);
    if (!result) {
      // console.log("Back to step " + stepsCount);
      this.removeSteps(stepsCount);
    }
    return result;
  }

  private move(board: Board, iFrom: number, iTo: number): Board {
    board = board.clone();
    board.containers[iTo].push(board.containers[iFrom].pop());
    return board;
  }

  private removeSteps(stepCount: number) {
    while (this.steps.length > stepCount) {
      this.steps.pop();
    }
  }


}
