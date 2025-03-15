import { Color } from "../model/colors.class";
import { GameContainer } from "../model/game/game-container.class";
import { LogicResult, makeStep, TLogicFunction } from "./logic-controller.interface";

export function getLogic1To3(): TLogicFunction {
  return (gameContainers: GameContainer[]) => {
    const result = new LogicResult();
    let hasStep = true;
    while (hasStep) {
      hasStep = false;
      for (let iTo = 0; iTo < gameContainers.length; iTo++) {
        if (GameContainer.hasOnlyThreeOfOneColor(gameContainers[iTo])) {
          const iFrom = getColorContainerIndex(gameContainers, gameContainers[iTo].colors[0], iTo);
          if (iFrom !== -1) {
            gameContainers = makeStep(gameContainers, iFrom, iTo, 1, result);
            hasStep = true;
            break;
          }
        }
      }
    }
    // console.log("Logic 1 to 3 made " + result.stepCount + " steps.");
    return result;
  }

  function getColorContainerIndex(gameContainers: GameContainer[], color: Color, excludeIndex: number): number {
    for (let i = 0; i < gameContainers.length; i++) {
      if (i !== excludeIndex && !GameContainer.isEmpty(gameContainers[i]) && GameContainer.peek(gameContainers[i]) === color) {
        return i;
      }
    }
    return -1;
  }

}
