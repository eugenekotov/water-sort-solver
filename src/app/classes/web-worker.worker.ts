/// <reference lib="webworker" />

import { getLogic1To3 } from "./logic/logic-1to3.class";
import { getLogic2To2 } from "./logic/logic-2to2.class";
import { getLogic3To1 } from "./logic/logic-3to1.class";
import { LogicResult, TLogicFunction } from "./logic/logic-controller.interface";
import { BoardContainer } from "./model/board/board-container.class";
import { boardSetAdd, boardSetContains } from "./model/board/board-set.class";
import { Board, boardClone, boardCreate, boardCreate2, boardIsResolved2 } from "./model/board/board.class";
import { GameContainer } from "./model/game/game-container.class";
import { PlayContainer } from "./model/play-container.class";
import { Solution, solutionCreate, SolutionSet, solutionSetAdd } from "./model/solution-set.class";
import { EWorkerResult, Step, WorkerResult } from "./solution-controller.class";

class SolutionData {
  containers: PlayContainer[] = [];
  containers2: GameContainer[] = [];
  oldBoards: Board[] = [];
  steps: Step[] = [];
  solutions: SolutionSet = new SolutionSet();
  bestSolution: Solution | undefined = undefined;
  counter: number = 0;
  logicFunctions: TLogicFunction[] = [];
}

function solve(containers: GameContainer[]) {
  const solutionData = new SolutionData();
  // solutionData.containers = containers;
  solutionData.containers2 = containers;
  solutionData.oldBoards = [];
  solutionData.steps = [];
  solutionData.solutions.solutions = [];
  solutionData.bestSolution = undefined;
  solutionData.counter = 0;
  solutionData.logicFunctions.push(getLogic1To3());
  solutionData.logicFunctions.push(getLogic2To2());
  solutionData.logicFunctions.push(getLogic3To1());
  tryToResolve(solutionData, boardCreate2(solutionData.containers2), 0);
  if (solutionData.bestSolution === undefined) {
    postSolution(EWorkerResult.NO_SOLUTION, undefined);
  } else {
    postSolution(EWorkerResult.BEST_SOLUTION, solutionData.bestSolution);
  }
}

function tryToResolve(solutionData: SolutionData, board: Board, stepCount: number) {
  console.log(stepCount);
  solutionData.counter++;
  // console.log("Counter ", solutionData.counter, "Counter ", "We have ", solutionData.solutions.solutions.length, "solutions");
  if (boardIsResolved2(board)) {
    foundSolution(solutionData);
    return;
  }

  const logcResult = tryLogicPatterns(solutionData, board);
  if (logcResult.stepCount > 0) {
    board = logcResult.board;
    stepCount = stepCount + logcResult.stepCount;
    boardSetAdd(solutionData.oldBoards, logcResult.oldBoards);
    solutionData.steps = [...solutionData.steps, ...logcResult.steps];
    if (boardIsResolved2(board)) {
      foundSolution(solutionData);
      return;
    }
  }

  // Try to check all options
  for (let iFrom = 0; iFrom < board.containers.length; iFrom++) {
    // Try to find place for each
    for (let iTo = 0; iTo < board.containers.length; iTo++) {
      if (iFrom !== iTo) {
        // console.log("Level " + stepCount + " check step " + iFrom + " -> " + iTo);
        tryToMove(solutionData, board, iFrom, iTo, stepCount);
      }
    }
  }
}

function tryLogicPatterns(solutionData: SolutionData, board: Board): LogicResult {
  const result = new LogicResult();
  let hasStep = true;
  while (hasStep) {
    hasStep = false;
    solutionData.logicFunctions.forEach(logicFunction => {
      const logicResult = logicFunction(board);
      if (logicResult.stepCount > 0) {
        hasStep = true;
        board = logicResult.board;
        result.stepCount = result.stepCount + logicResult.stepCount;
        boardSetAdd(result.oldBoards, logicResult.oldBoards);
        result.steps = [...result.steps, ...logicResult.steps];
      }
    });
  }
  result.board = board;
  return result;
}

function tryToMove(solutionData: SolutionData, board: Board, iFrom: number, iTo: number, stepCount: number) {
  if (BoardContainer.isEmpty(board.boardContainers[iFrom])) {
    // Nothing to take
    return;
  }
  if (BoardContainer.isFull(board.boardContainers[iTo])) {
    // No place to put
    return;
  }
  if (!BoardContainer.isEmpty(board.boardContainers[iTo]) && BoardContainer.peek(board.boardContainers[iFrom]) != BoardContainer.peek(board.boardContainers[iTo])) {
    // Not suitable color
    return;
  }
  if (BoardContainer.size(board.boardContainers[iFrom]) == 1 && BoardContainer.isEmpty(board.boardContainers[iTo])) {
    // Stupid move;
    return;
  }
  if (BoardContainer.hasOnlyThreeOfOneColor(board.boardContainers[iFrom])) {
    // Stupid move;
    return;
  }
  if (BoardContainer.hasOnlyOneColor(board.boardContainers[iFrom]) && BoardContainer.isEmpty(board.boardContainers[iTo])) {
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
  solutionData.steps.push(new Step(
    board.containers[iFrom].index,
    board.containers[iTo].index,
    BoardContainer.peek(board.boardContainers[iTo])));
  boardSetAdd(solutionData.oldBoards, board);
  tryToResolve(solutionData, board, stepCount + 1);
  removeSteps(solutionData, stepCount);
}

function move(board: Board, iFrom: number, iTo: number): Board {
  board = boardClone(board);
  BoardContainer.push(board.boardContainers[iTo], BoardContainer.pop(board.boardContainers[iFrom]));
  return board;
}

function removeSteps(solutionData: SolutionData, stepCount: number) {
  while (solutionData.steps.length > stepCount) {
    solutionData.steps.pop();
  }
}

function foundSolution(solutionData: SolutionData) {
  const solution = optimizeSolution(solutionCreate(solutionData.steps));
  if (solutionSetAdd(solutionData.solutions, solution)) {
    if (solutionData.bestSolution === undefined) {
      solutionData.bestSolution = solution;
      postSolution(EWorkerResult.SOLUTION, solution);
    } else if (solution.steps.length < solutionData.bestSolution.steps.length) {
      solutionData.bestSolution = solution;
      postSolution(EWorkerResult.SOLUTION, solution);
    }
  }
}

function postSolution(workerResult: EWorkerResult, solution: Solution | undefined) {
  const result: WorkerResult = {
    result: workerResult,
    solution: solution
  }
  postMessage(result);
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

addEventListener('message', ({ data }) => {
  solve(data as GameContainer[]);
});
