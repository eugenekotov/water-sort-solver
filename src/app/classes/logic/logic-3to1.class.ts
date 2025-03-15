import { Color } from "../model/colors.class";
import { GameContainer } from "../model/game/game-container.class";
import { LogicResult, makeStep, TLogicFunction } from "./logic-controller.interface";

export function getLogic3To1(): TLogicFunction {

  return (gameContainers: GameContainer[]) => {
    const result = new LogicResult();
    let hasStep = true;
    while (hasStep) {
      hasStep = false;
      for (let iTo = 0; iTo < gameContainers.length; iTo++) {
        if (GameContainer.hasOnlyOneOfOneColor(gameContainers[iTo])) {
          const iFrom = getColorThreeContainerIndex(gameContainers, gameContainers[iTo].colors[0], iTo);
          if (iFrom !== -1) {
            gameContainers = makeStep(gameContainers, iFrom, iTo, 3, result);
            hasStep = true;
            break;
          }
        }
      }
    }
    // console.log("Logic 3 to 1 made " + result.stepCount + " steps.");
    return result;
  }

  function getColorThreeContainerIndex(gameContainers: GameContainer[], color: Color, excludeIndex: number): number {
    for (let i = 0; i < gameContainers.length; i++) {
      if (i !== excludeIndex && GameContainer.size(gameContainers[i]) == 4
        && gameContainers[i].colors[GameContainer.size(gameContainers[i]) - 1] === color
        && gameContainers[i].colors[GameContainer.size(gameContainers[i]) - 2] === color
        && gameContainers[i].colors[GameContainer.size(gameContainers[i]) - 3] === color) {
        return i;
      }
    }
    return -1;
  }

}
