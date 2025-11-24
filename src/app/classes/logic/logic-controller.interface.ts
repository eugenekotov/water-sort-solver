import { GameController } from "../controller/game-controller.class";
import { GameContainer } from "../model/game/game-container.class";
import { Step } from "../solution-controller.class";

export class LogicResult {
    containers: GameContainer[];
    stepCount: number = 0;
    hashes: Set<string> = new Set();
    steps: Step[] = [];
}

export type TLogicFunction = (containers: GameContainer[]) => LogicResult;

export function makeStep(containers: GameContainer[], iFrom: number, iTo: number, stepCount: number, result: LogicResult): GameContainer[] {
    containers = GameContainer.cloneContainers(containers);
    for (let i = 0; i < stepCount; i++) {
        GameContainer.push(containers[iTo], GameContainer.pop(containers[iFrom]));
        result.steps.push(new Step(
            containers[iFrom].index,
            containers[iTo].index,
            GameContainer.peek(containers[iTo])));
    }
    result.containers = containers;
    result.stepCount = result.stepCount + stepCount;
    result.hashes.add(GameController.getGameHash(containers));
    return containers;
}
