import { Color } from "../model/colors.class";
import { GameContainer } from "../model/game/game-container.class";
import { LogicResult, makeStep, TLogicFunction } from "./logic-controller.interface";

export function getLogic2To2(): TLogicFunction {

  return (gameContainers: GameContainer[]) => {
    const result = new LogicResult();
    let hasStep = true;
    while (hasStep) {
      hasStep = false;
      for (let iTo = 0; iTo < gameContainers.length; iTo++) {
        if (GameContainer.hasOnlyTwoOfOneColor(gameContainers[iTo])) {
          const iFrom = getColorTwoContainerIndex(gameContainers, gameContainers[iTo].colors[0], iTo);
          if (iFrom !== -1) {
            gameContainers = makeStep(gameContainers, iFrom, iTo, 2, result);
            hasStep = true;
            break;
          }
        }
      }
    }
    // console.log("Logic 2 to 2 made " + result.stepCount + " steps.");
    return result;
  }

  function getColorTwoContainerIndex(gameContainers: GameContainer[], color: Color, excludeIndex: number): number {
    for (let i = 0; i < gameContainers.length; i++) {
      if (i !== excludeIndex && GameContainer.size(gameContainers[i]) > 1
        && gameContainers[i].colors[GameContainer.size(gameContainers[i]) - 1] === color
        && gameContainers[i].colors[GameContainer.size(gameContainers[i]) - 2] === color) {
        return i;
      }
    }
    return -1;
  }

}
