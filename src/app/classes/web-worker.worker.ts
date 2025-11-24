/// <reference lib="webworker" />

import { GameController } from "./controller/game-controller.class";
import { getLogic1To3 } from "./logic/logic-1to3.class";
import { getLogic2To2 } from "./logic/logic-2to2.class";
import { getLogic3To1 } from "./logic/logic-3to1.class";
import { LogicResult, TLogicFunction } from "./logic/logic-controller.interface";
import { GameContainer } from "./model/game/game-container.class";
import { Solution, solutionCreate, SolutionSet, solutionSetAdd } from "./model/solution-set.class";
import { EWorkerResult, Step, WorkerResult } from "./solution-controller.class";

class SolutionData {
  containers: GameContainer[] = [];
  hashes: Set<string> = new Set();
  steps: Step[] = [];
  solutions: SolutionSet = new SolutionSet();
  bestSolution: Solution | undefined = undefined;
  counter: number = 0;
  logicFunctions: TLogicFunction[] = [];
}

function solve(containers: GameContainer[]) {
  const solutionData = new SolutionData();
  solutionData.containers = containers;
  solutionData.hashes = new Set();
  solutionData.steps = [];
  solutionData.solutions.solutions = [];
  solutionData.bestSolution = undefined;
  solutionData.counter = 0;
  solutionData.logicFunctions.push(getLogic1To3());
  solutionData.logicFunctions.push(getLogic2To2());
  solutionData.logicFunctions.push(getLogic3To1());
  tryToResolve(solutionData, GameContainer.cloneContainers(solutionData.containers), 0);
  if (solutionData.bestSolution === undefined) {
    postSolution(EWorkerResult.NO_SOLUTION, undefined);
  } else {
    postSolution(EWorkerResult.BEST_SOLUTION, solutionData.bestSolution);
  }
}

function tryToResolve(solutionData: SolutionData, containers: GameContainer[], stepCount: number) {
  // console.log(stepCount);
  solutionData.counter++;
  // console.log("Counter ", solutionData.counter, "Counter ", "We have ", solutionData.solutions.solutions.length, "solutions");
  if (GameContainer.isResolvedContainers(containers)) {
    foundSolution(solutionData);
    return;
  }

  const logcResult = tryLogicPatterns(solutionData, containers);
  if (logcResult.stepCount > 0) {
    containers = logcResult.containers;
    stepCount = stepCount + logcResult.stepCount;
    solutionData.hashes = new Set([...solutionData.hashes, ...logcResult.hashes]);
    solutionData.steps = [...solutionData.steps, ...logcResult.steps];
    if (GameContainer.isResolvedContainers(containers)) {
      foundSolution(solutionData);
      return;
    }
  }

  // Try to check all options
  for (let iFrom = 0; iFrom < containers.length; iFrom++) {
    // Try to find place for each
    for (let iTo = 0; iTo < containers.length; iTo++) {
      if (iFrom !== iTo) {
        // console.log("Level " + stepCount + " check step " + iFrom + " -> " + iTo);
        tryToMove(solutionData, containers, iFrom, iTo, stepCount);
      }
    }
  }
}

function tryLogicPatterns(solutionData: SolutionData, containers: GameContainer[]): LogicResult {
  const result = new LogicResult();
  let hasStep = true;
  while (hasStep) {
    hasStep = false;
    solutionData.logicFunctions.forEach(logicFunction => {
      const logicResult = logicFunction(containers);
      if (logicResult.stepCount > 0) {
        hasStep = true;
        containers = logicResult.containers;
        result.stepCount = result.stepCount + logicResult.stepCount;
        result.hashes = new Set([...result.hashes, ...logicResult.hashes]);
        result.steps = [...result.steps, ...logicResult.steps];
      }
    });
  }
  result.containers = containers;
  return result;
}

function tryToMove(solutionData: SolutionData, containers: GameContainer[], iFrom: number, iTo: number, stepCount: number) {
  if (GameContainer.isEmpty(containers[iFrom])) {
    // Nothing to take
    return;
  }
  if (GameContainer.isFull(containers[iTo])) {
    // No place to put
    return;
  }
  if (!GameContainer.isEmpty(containers[iTo]) && GameContainer.peek(containers[iFrom]) != GameContainer.peek(containers[iTo])) {
    // Not suitable color
    return;
  }
  if (GameContainer.size(containers[iFrom]) == 1 && GameContainer.isEmpty(containers[iTo])) {
    // Stupid move;
    return;
  }
  if (GameContainer.hasOnlyThreeOfOneColor(containers[iFrom])) {
    // Stupid move;
    return;
  }
  if (GameContainer.hasOnlyOneColor(containers[iFrom]) && GameContainer.isEmpty(containers[iTo])) {
    // if we have only one color and move to empty container
    // Stupid move;
    return;
  }

  // We can try to move
  containers = move(containers, iFrom, iTo);

  if (solutionData.hashes.has(GameController.getGameHash(containers))) {
    // We already tried it
    return;
  }
  solutionData.steps.push(new Step(
    containers[iFrom].index,
    containers[iTo].index,
    GameContainer.peek(containers[iTo])));

  solutionData.hashes.add(GameController.getGameHash(containers));
  tryToResolve(solutionData, containers, stepCount + 1);
  removeSteps(solutionData, stepCount);
}

function move(containers: GameContainer[], iFrom: number, iTo: number): GameContainer[] {
  containers = GameContainer.cloneContainers(containers);
  GameContainer.push(containers[iTo], GameContainer.pop(containers[iFrom]));
  return containers;
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
    optimized = false;

    // Optimize case 1 -> 2, ..., 2-> 1
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
      while (j < steps.length && (steps[i].iTo !== steps[j].iFrom || steps[i].color !== steps[j].color)) {
        j++;
      }
      if (j < steps.length && steps[i].iTo === steps[j].iFrom && steps[i].color === steps[j].color) {
        // We found, lets check that these containers was not used
        // We should not use steps[i].iFrom, steps[i].iTo, steps[j].iFrom, steps[j].iTo
        let restrictedContainers: number[] = [steps[i].iFrom, steps[i].iTo, steps[j].iFrom, steps[j].iTo];


        let k = j - 1;
        let used = false;
        while (i < k) {
          if (restrictedContainers.includes(steps[k].iFrom) || restrictedContainers.includes(steps[k].iTo)) {
            used = true;
            break;
          }
          k--;
        }
        if (!used) {
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

    // Optimize case 1 -> 1, it is possible after previous optimizations
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

  // Group steps 1 -> 2, 1 -> 2 to 1 -> 2 (2)
  let count4 = 0;
  i = 0;
  while (i < steps.length - 1) {
    if (steps[i].iFrom === steps[i + 1].iFrom && steps[i].iTo === steps[i + 1].iTo) {
      steps[i + 1].count = steps[i + 1].count + steps[i].count;
      steps.splice(i, 1);
      count4++;
    } else {
      i++;
    }
  }
  // console.log("Grouping - " + count4);

  return solution;
}

addEventListener('message', ({ data }) => {
  solve(data as GameContainer[]);
});
