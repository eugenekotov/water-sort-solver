import { Subject } from "rxjs";
import { Board } from "./model/board.class";
import { PlayContainer } from "./model/play-container.class";
import { ILogicController, LogicResult } from "./logic/logic-controller.interface"
import { BoardsSet } from "./model/boards-set.class";
import { Logic1To3 } from "./logic/logic-1to3.class";
import { Logic2To2 } from "./logic/logic-2to2.class";
import { Logic3To1 } from "./logic/logic-3to1.class";
import { Color } from "./model/colors.class";

export class Step {
  iFrom: number;
  iTo: number;
  color: Color;
  notes: string = "";

  constructor(iFrom: number, iTo: number, color: Color) {
    this.iFrom = iFrom;
    this.iTo = iTo;
    this.color = color;
  }

  public clone(): Step {
    const step = new Step(this.iFrom, this.iTo, this.color);
    step.notes = this.notes;
    return step;
  }
}

export class Solution {
  steps: Step[] = [];

  constructor(steps: Step[]) {
    this.steps = [];
    steps.forEach(step => this.steps.push(step.clone()));
  }
}

export class SolutionController {

  private cancel$ = new Subject<void>();
  private oldBoards: BoardsSet = new BoardsSet();
  private steps: Step[] = [];
  solutions: Solution[] = [];
  bestSolution: Solution;
  solutionCount = 0;
  counter: number = 0;
  logicControllers: ILogicController[] = [];

  constructor() {
    this.logicControllers.push(new Logic1To3());
    this.logicControllers.push(new Logic2To2());
    this.logicControllers.push(new Logic3To1());
  }

  solve(containers: PlayContainer[]): void {
    this.oldBoards.clear();
    this.steps = [];
    this.counter = 0;
    this.tryToResolve(new Board(containers).clone(), 0);
    console.log("Found " + this.solutions.length + " solutions");
    this.getBestSolution();
  }

  private getBestSolution(): void {
    if (this.solutions.length > 0) {
      this.bestSolution = this.solutions[0];
      this.solutions.forEach(solution => {
        console.log(solution.steps.length);
        if (solution.steps.length < this.bestSolution!.steps.length) {
          this.bestSolution = solution;
        }
      });
    }
  }

  private optimizeSolution(steps: Step[]): Step[] {
    let count1 = 0;
    let count2 = 0;
    let count3 = 0;
    let i = 0;
    let optimized = true;
    while (optimized) {
      // Optimize case 1 -> 2, ..., 2-> 1
      // steps.forEach((step, index) => console.log("Step " + index + ": " + step.iFrom + " -> " + step.iTo));
      optimized = false;
      i = 0;
      let j = 0;
      while (i < steps.length - 1) {
        const checkingStep = steps[i];
        let j = i + 1;
        while (j < steps.length && (steps[i].iFrom !== steps[j].iTo || steps[i].iTo !== steps[j].iFrom)) {
          if (steps[i].iFrom === steps[j].iFrom || steps[i].iFrom === steps[j].iTo ||
              steps[i].iTo === steps[j].iFrom || steps[i].iTo === steps[j].iTo) {
            break;
          }
          j++;
        }
        if (j < steps.length && (steps[i].iFrom === steps[j].iTo && steps[i].iTo === steps[j].iFrom)) {
          // found back step, remove both
          steps.splice(j, 1);
          steps.splice(i, 1);
          // console.log("remove steps " + j + ", " + i);
          optimized = true;
          count1++;
        } else {
          i++;
        }
      }

      // Optimize case 1 -> 2, ..., 2 -> 3 to 1 -> 3
      i = 0;
      while (i < steps.length - 1) {
        // try to find second part
        let j = i + 1;
        while (j < steps.length && steps[i].iTo !== steps[j].iFrom) {
          j++;
        }
        if (j < steps.length && steps[i].iTo === steps[j].iFrom) {
          // We found, lets check that these containers was not used
          let k = j - 1;
          let used = false;
          while (i < k) {
            // TODO: improve logic
            if ((steps[k].iFrom === steps[j].iFrom || steps[k].iFrom === steps[j].iTo
                || steps[k].iTo === steps[j].iFrom || steps[k].iTo === steps[j].iTo) && steps[k].color !== steps[j].color) {
              used = true;
              break;
            }
            k--;

          }
          if (used === false) {
            steps[i].iTo = steps[j].iTo;
            steps[i].notes = "Updated by optimization 2";
            steps.splice(j, 1);
            // console.log("remove step " + j);
            optimized = true;
            count2++;
          } else {
            i++;
          }
        } else {
          i++;
        }
      }

      // Optimize case 1 -> 1
      i = 0;
      while (i < steps.length - 1) {
        if (steps[i].iFrom === steps[i].iTo) {
          steps.splice(i, 1);
          optimized = true;
          count3++;
        } else {
          i++;
        }
      }
    }
    console.log("Optimization 1 - " + count1);
    console.log("Optimization 2 - " + count2);
    console.log("Optimization 3 - " + count3);
    return steps;
  }

  cancel() {
    this.cancel$.next();
  }

  private tryToResolve(board: Board, stepCount: number): boolean {
    this.counter++;
    if (board.isResolved()) {
      this.foundSolution();
      return false;
    }

    const logcResult = this.tryLogicPatterns(board);
    if (logcResult.stepCount > 0) {
      board = logcResult.board;
      stepCount = stepCount + logcResult.stepCount;
      this.oldBoards.add(logcResult.oldBoards);
      this.steps = [...this.steps, ...logcResult.steps];
      if (board.isResolved()) {
        this.foundSolution();
        return false;
      }
    }

    // Try to check all options
    for (let iFrom = 0; iFrom < board.containers.length; iFrom++) {
      // Try to find place for each
      for (let iTo = 0; iTo < board.containers.length; iTo++) {
        if (iFrom !== iTo) {
          if (stepCount === 0) {
            console.log("First level check step " + iFrom + " -> " + iTo);
          }
          if (this.tryToMove(board, iFrom, iTo, stepCount)) {
            return false;
          }
        }
      }
    }
    return false;
  }

  private foundSolution() {
    this.solutionCount++;
    // TODO: check is the solution unique
    this.solutions.push(new Solution(this.optimizeSolution(this.steps)));
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

  private tryToMove(board: Board, iFrom: number, iTo: number, stepCount: number): boolean {
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
    this.steps.push(new Step(board.containers[iFrom].index, board.containers[iTo].index, board.containers[iTo].items[board.containers[iTo].size() - 1].color!));
    this.oldBoards.add(board);
    const result = this.tryToResolve(board, stepCount + 1);
    if (!result) {
      // console.log("Back to step " + stepCount);
      this.removeSteps(stepCount);
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
