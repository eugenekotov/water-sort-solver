import { Step } from "../solution-controller.class";

export class Solution {

    steps: Step[] = [];

    static clone(solution: Solution): Solution {
        const result = new Solution();
        result.steps = solution.steps.map(step => Step.clone(step));
        return result;
    }

}

export class SolutionSet {

    solutions: Solution[] = [];

}

export function solutionCreate(steps: Step[]): Solution {
    const solution = new Solution();
    solution.steps = [];
    steps.forEach(step => solution.steps.push(step.clone()));
    return solution;
}

export function solutionEquals(solution1: Solution, solution2: Solution) {
    if (solution1.steps.length !== solution2.steps.length) {
        return false;
    }
    for (let i = 0; i < solution1.steps.length; i++) {
        if (!solution1.steps[i].equals(solution2.steps[i])) {
            return false;
        }
    }
    return true;
}

export function solutionSetAdd(solutions: SolutionSet, solution: Solution): boolean {
    if (!solutions.solutions.some(existsSolution => solutionEquals(existsSolution, solution))) {
        solutions.solutions.push(solution);
        return true;
    }
    return false;
}
