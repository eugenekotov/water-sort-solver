import { Color } from "../model/colors.class";
import { GameContainer } from "../model/game/game-container.class";
import { LogicResult, makeStep, TLogicFunction } from "./logic-controller.interface";

export function getLogic1To3(): TLogicFunction {
  return (containers: GameContainer[]) => {
    const result = new LogicResult();
    let hasStep = true;
    while (hasStep) {
      hasStep = false;
      for (let iTo = 0; iTo < containers.length; iTo++) {
        if (GameContainer.hasOnlyThreeOfOneColor(containers[iTo])) {
          const iFrom = getColorContainerIndex(containers, containers[iTo].colors[0], iTo);
          if (iFrom !== -1) {
            containers = makeStep(containers, iFrom, iTo, 1, result);
            hasStep = true;
            break;
          }
        }
      }
    }
    // console.log("Logic 1 to 3 made " + result.stepCount + " steps.");
    return result;
  }

  function getColorContainerIndex(containers: GameContainer[], color: Color, excludeIndex: number): number {
    for (let i = 0; i < containers.length; i++) {
      if (i !== excludeIndex && !GameContainer.isEmpty(containers[i]) && GameContainer.peek(containers[i]) === color) {
        return i;
      }
    }
    return -1;
  }

}
