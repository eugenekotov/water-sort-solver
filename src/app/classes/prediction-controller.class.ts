import { Color } from "./model/colors.class";
import { CONTAINER_SIZE } from "./model/const.class";
import { GameContainer } from "./model/game/game-container.class";


class CheckMoveResult {

    constructor (
            public index: number,
            public canMove: boolean,
            public moveToEmpty: boolean,
            public destinationHasOnlyColor: boolean,
            public emptySlotCount: number,
        ) {
    }
}

export class PredictionController {

    private containers: GameContainer[] = [];
    private selectedContainerIndex: number | undefined;
    private predictedIndex: number | undefined;
    private predictedIndexTimeout: NodeJS.Timeout;

    createContainers(containers: GameContainer[]) {
        this.containers = GameContainer.cloneContainers(containers);
        this.selectedContainerIndex = undefined;
    }

    handleClick(index: number) {
        if (this.selectedContainerIndex === undefined) {
            // select container
            this.selectedContainerIndex = index;
        } else {
            // Moving colors if it is possible
            this.move(this.selectedContainerIndex, index);
            this.selectedContainerIndex = undefined;
        }
    }

    private move(indexFrom: number, indexTo: number) {
        if (indexFrom === indexTo) {
            // Clicked the same
            return;
        }
        if (this.containers[indexFrom].size() === 0 || this.containers[indexTo].size() === CONTAINER_SIZE) {
            // Source - empty, destination - full
            return;
        }
        if (this.containers[indexTo].size() !== 0 && this.containers[indexTo].peek() !== this.containers[indexFrom].peek()) {
            // Different top colors and destination not empty
            return;
        }
        const color = this.containers[indexFrom].peek();
        const fromCount = this.containers[indexFrom].getTopColorCount();
        const toCount = CONTAINER_SIZE - this.containers[indexTo].size();
        const count = Math.min(fromCount, toCount);
        for (let i = 0; i < count; i++) {
            this.containers[indexFrom].pop();
            this.containers[indexTo].push(color);
        }
    }

    checkIfPredicted(index: number): boolean {
        const result = this.predictedIndex === index;
        clearTimeout(this.predictedIndexTimeout);
        this.predictedIndex = undefined;
        return result;
    }

    private setPrediction(index: number): number {
        this.predictedIndex = index;
        this.predictedIndexTimeout = setTimeout(
            () => {
                this.predictedIndex = undefined;
                // console.log('predictedIndex cleared!');
            }, 3000);
        return index;
    }

    predictNextClick(): number | undefined {
        if (this.selectedContainerIndex === undefined) {
            return undefined;
        }
        const color = this.containers[this.selectedContainerIndex].peek();
        const fromCount = this.containers[this.selectedContainerIndex].getTopColorCount();
        let checkResults: CheckMoveResult[] = [];
        for (let i = 0; i < this.containers.length; i++) {
            if (i === this.selectedContainerIndex) {
                continue;
            }
            const checkResult = this.canMoveTo(i, color);
            if (checkResult.canMove) {
                checkResults.push(checkResult);
            }
        }
        // Select best prediction
        if (checkResults.length === 0) {
            return undefined;
        } else if (checkResults.length === 1) {
            return this.setPrediction(checkResults[0].index);
        } else if (checkResults.length === 2) {
            if (checkResults[0].moveToEmpty && checkResults[1].moveToEmpty) {
                // Both move to empty
                return this.setPrediction(checkResults[0].index);
            } else {
                if (checkResults[0].destinationHasOnlyColor) {
                    return this.setPrediction(checkResults[0].index);
                }
                if (checkResults[1].destinationHasOnlyColor) {
                    return this.setPrediction(checkResults[1].index);
                }
                if (GameContainer.hasOnlyOneColor(this.containers[this.selectedContainerIndex])) {
                    // container from has only one color
                    if (!checkResults[0].moveToEmpty && checkResults[0].emptySlotCount >= fromCount) {
                        return this.setPrediction(checkResults[0].index);
                    }
                    if (!checkResults[1].moveToEmpty && checkResults[1].emptySlotCount >= fromCount) {
                        return this.setPrediction(checkResults[1].index);
                    }
                }
            }
        } else if (checkResults.length === 3) {
            for (let i = 0; i < checkResults.length; i++) {
                if (checkResults[i].destinationHasOnlyColor && this.containers[checkResults[i].index].size() > 1) {
                    return this.setPrediction(checkResults[i].index);
                }
            }
        }
        return undefined;
    }

    private canMoveTo(index: number, color: Color): CheckMoveResult {
        const container: GameContainer = this.containers[index];
        if (container.size() === 0) {
            return new CheckMoveResult(index, true, true, false, CONTAINER_SIZE);
        }
        if (container.peek() === color && container.size() < CONTAINER_SIZE) {
            return new CheckMoveResult(index, true, false, GameContainer.hasOnlyOneColor(container), CONTAINER_SIZE - container.size());
        }
        return new CheckMoveResult(index, false, false, false, 0);
    }

}