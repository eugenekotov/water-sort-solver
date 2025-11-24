import { Color } from "../model/colors.class";
import { GameContainer } from "../model/game/game-container.class";
import { LogicResult, makeStep, TLogicFunction } from "./logic-controller.interface";

export function getLogic3To1(): TLogicFunction {

    return (containers: GameContainer[]) => {
        const result = new LogicResult();
        let hasStep = true;
        while (hasStep) {
            hasStep = false;
            for (let iTo = 0; iTo < containers.length; iTo++) {
                if (GameContainer.hasOnlyOneOfOneColor(containers[iTo])) {
                    const iFrom = getColorThreeContainerIndex(containers, containers[iTo].colors[0], iTo);
                    if (iFrom !== -1) {
                        containers = makeStep(containers, iFrom, iTo, 3, result);
                        hasStep = true;
                        break;
                    }
                }
            }
        }
        // console.log("Logic 3 to 1 made " + result.stepCount + " steps.");
        return result;
    }

    function getColorThreeContainerIndex(containers: GameContainer[], color: Color, excludeIndex: number): number {
        for (let i = 0; i < containers.length; i++) {
            if (i !== excludeIndex && GameContainer.size(containers[i]) == 4
                && containers[i].colors[GameContainer.size(containers[i]) - 1] === color
                && containers[i].colors[GameContainer.size(containers[i]) - 2] === color
                && containers[i].colors[GameContainer.size(containers[i]) - 3] === color) {
                return i;
            }
        }
        return -1;
    }

}
