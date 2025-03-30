import { TGameView } from "src/app/services/main.service";
import { GameContainer } from "./game/game-container.class";
import { SourceItem } from "./source-item.class";

export class State {

    view: TGameView;
    containers: GameContainer[]; // original containers without any steps
    // setup
    setupSourceItems: SourceItem[];
    // solve
    // solveContainers: GameContainer[]; // current state
    // solution: Solution;
    // completeStep: number;
    // play
    // playContainers: GameContainer[]; // current state
    // steps: PlayStep[];

    constructor(gameView: TGameView, containers: GameContainer[]) {
        this.view = gameView;
        this.containers = GameContainer.cloneContainers(containers);
    }

}