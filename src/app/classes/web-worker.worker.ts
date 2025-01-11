/// <reference lib="webworker" />

import { boardSetAdd, boardSetContains } from "./model/board-set.class";
import { Board, boardClone, boardCreate, boardIsResolved } from "./model/board.class";
import { containerHasOnlyOneColor, containerHasOnlyThreeOfOneColor, containerIsEmpty, containerIsFull, containerPeek, containerPop, containerPush, containerSize, PlayContainer } from "./model/play-container.class";
import { Solution, solutionCreate, SolutionSet, solutionSetAdd } from "./model/solution-set.class";
import { EWorkerResult, Step, WorkerResult } from "./solution-controller.class";

const REQUIRED_SOLUTION_COUNT = 10;

class SolutionData {
  containers: PlayContainer[] = [];
  oldBoards: Board[] = [];
  steps: Step[] = [];
  solutions: SolutionSet = new SolutionSet();
  bestSolution: Solution | undefined = undefined;
  counter: number = 0;
  // logicControllers: ILogicController[] = [];
  // logicFunctions: TLogicFunction[] = [];
}

function solve(containers: PlayContainer[]): SolutionData {
  const solutionData = new SolutionData();
  solutionData.containers = containers;
  solutionData.oldBoards = [];
  solutionData.steps = [];
  solutionData.solutions.solutions = [];
  solutionData.bestSolution = undefined;
  solutionData.counter = 0;
  tryToResolve(solutionData, boardClone(boardCreate(solutionData.containers)), 0);
  // console.log("Found " + this.solutionCount() + " solutions");
  solutionData.bestSolution = solutionSetGetBest(solutionData.solutions);
  return solutionData;
}

function tryToResolve(solutionData: SolutionData, board: Board, stepCount: number) {
  solutionData.counter++;
  console.log("Counter ", solutionData.counter);
  if (boardIsResolved(board)) {
    foundSolution(solutionData);
    return;
  }

  // const logcResult = tryLogicPatterns(solutionData, board);
  // if (logcResult.stepCount > 0) {
  //   board = logcResult.board;
  //   stepCount = stepCount + logcResult.stepCount;
  //   boardSetAdd(solutionData.oldBoards, logcResult.oldBoards);
  //   solutionData.steps = [...solutionData.steps, ...logcResult.steps];
  //   if (boardIsResolved(board)) {
  //     foundSolution(solutionData);
  //     return;
  //   }
  // }

  // Try to check all options
  for (let iFrom = 0; iFrom < board.containers.length; iFrom++) {
    // Try to find place for each
    for (let iTo = 0; iTo < board.containers.length; iTo++) {
      if (iFrom !== iTo) {
        // console.log("Level " + stepCount + " check step " + iFrom + " -> " + iTo);
        tryToMove(solutionData, board, iFrom, iTo, stepCount);
        // console.log(this.solutionCount());
        if (solutionData.solutions.solutions.length >= REQUIRED_SOLUTION_COUNT) {
          // It is enought
          return;
        }
      }
    }
  }
}

// function tryLogicPatterns(solutionData: SolutionData, board: Board): LogicResult {
//   const result = new LogicResult();
//   let hasStep = true;
//   while (hasStep) {
//     hasStep = false;
//     solutionData.logicFunctions.forEach(logicFunction => {
//       const logicResult = logicFunction(board);
//       if (logicResult.stepCount > 0) {
//         hasStep = true;
//         board = logicResult.board;
//         result.stepCount = result.stepCount + logicResult.stepCount;
//         boardSetAdd(result.oldBoards, logicResult.oldBoards);
//         result.steps = [...result.steps, ...logicResult.steps];
//       }
//     });
//   }
//   result.board = board;
//   return result;
// }

function tryToMove(solutionData: SolutionData, board: Board, iFrom: number, iTo: number, stepCount: number) {
  if (containerIsEmpty(board.containers[iFrom])) {
    // Nothing to take
    return;
  }
  if (containerIsFull(board.containers[iTo])) {
    // No place to put
    return;
  }
  if (!containerIsEmpty(board.containers[iTo]) && containerPeek(board.containers[iFrom]) != containerPeek(board.containers[iTo])) {
    // Not suitable color
    return;
  }
  if (containerSize(board.containers[iFrom]) == 1 && containerIsEmpty(board.containers[iTo])) {
    // Stupid move;
    return;
  }
  if (containerHasOnlyThreeOfOneColor(board.containers[iFrom])) {
    // Stupid move;
    return;
  }
  if (containerHasOnlyOneColor(board.containers[iFrom]) && containerIsEmpty(board.containers[iTo])) {
    // if we have only one color and move to empty container
    // Stupid move;
    return;
  }

  // We can try to move
  board = move(board, iFrom, iTo);
  // console.log("Moved one from " + iFrom + " to " + iTo);
  if (boardSetContains(solutionData.oldBoards, board)) {
    // We already tried it
    // console.log("We already tried it!");
    return;
  }
  solutionData.steps.push(new Step(board.containers[iFrom].index, board.containers[iTo].index, board.containers[iTo].items[containerSize(board.containers[iTo]) - 1].color!));
  boardSetAdd(solutionData.oldBoards, board);
  tryToResolve(solutionData, board, stepCount + 1);
  removeSteps(solutionData, stepCount);
}

function move(board: Board, iFrom: number, iTo: number): Board {
  board = boardClone(board);
  containerPush(board.containers[iTo], containerPop(board.containers[iFrom]));
  return board;
}

function removeSteps(solutionData: SolutionData, stepCount: number) {
  while (solutionData.steps.length > stepCount) {
    solutionData.steps.pop();
  }
}

function foundSolution(solutionData: SolutionData) {
  const solution = optimizeSolution(solutionCreate(solutionData.steps));
  solutionSetAdd(solutionData.solutions, solution);
  if (solutionData.solutions.solutions.length === 1) {
    const result: WorkerResult = {
      result: EWorkerResult.FIST_SOLUTION,
      solution: solution
    }
    postMessage(result);
  }
}

function optimizeSolution(solution: Solution): Solution {
  const steps = solution.steps;
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
  // console.log("Optimization 1 - " + count1);
  // console.log("Optimization 2 - " + count2);
  // console.log("Optimization 3 - " + count3);
  return solution;
}

function solutionSetGetBest(solutions: SolutionSet): Solution | undefined {
  let result: Solution | undefined = undefined;
  if (solutions.solutions.length > 0) {
    result = solutions.solutions[0];
    // console.log("Best solution contains " + result.steps.length + " steps.")
    solutions.solutions.forEach(solution => {
      // console.log(solution.steps.length);
      if (solution.steps.length < result!.steps.length) {
        result = solution;
        // console.log("Best solution contains " + result.steps.length + " steps.")
      }
    });
  }
  return result;
}

addEventListener('message', ({ data }) => {
  const resultData: SolutionData = solve(data as PlayContainer[]);
  const result: WorkerResult = {
    result: resultData.solutions.solutions.length > 0 ? EWorkerResult.BEST_SOLUTION : EWorkerResult.NO_SOLUTION,
    solution: resultData.bestSolution
  }
  postMessage(result);
});
