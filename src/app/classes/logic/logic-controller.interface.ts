import { GameController } from "../controller/game-controller.class";
import { GameContainer } from "../model/game/game-container.class";
import { Step } from "../solution-controller.class";

export class LogicResult {
  gameContainers: GameContainer[];
  stepCount: number = 0;
  hashes: Set<string> = new Set();
  steps: Step[] = [];
}

export type TLogicFunction = (gameContainers: GameContainer[]) => LogicResult;

export function makeStep(gameContainers: GameContainer[], iFrom: number, iTo: number, stepCount: number, result: LogicResult): GameContainer[] {
  gameContainers = GameContainer.cloneContainers(gameContainers);
  for (let i = 0; i < stepCount; i++) {
    GameContainer.push(gameContainers[iTo], GameContainer.pop(gameContainers[iFrom]));
    result.steps.push(new Step(
      gameContainers[iFrom].index,
      gameContainers[iTo].index,
      GameContainer.peek(gameContainers[iTo])));
  }
  result.gameContainers = gameContainers;
  result.stepCount = result.stepCount + stepCount;
  result.hashes.add(GameController.getGameHash(gameContainers));
  return gameContainers;
}
