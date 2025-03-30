import { TGameView } from "src/app/services/main.service";
import { GameContainer } from "./game/game-container.class";
import { SourceItem } from "./source-item.class";
import { PlayStep } from "src/app/components/board-play/board-play.component";
import { Solution } from "./solution-set.class";

export class State {

    view: TGameView;
    containers: GameContainer[]; // original containers without any steps
    // setup
    setupSourceItems: SourceItem[];
    // play
    playContainers: GameContainer[]; // current state
    steps: PlayStep[];
    // solve
    solveContainers: GameContainer[]; // current state
    solution: Solution | undefined;
    completeStepIndex: number;

    constructor(gameView: TGameView, containers: GameContainer[]) {
        this.view = gameView;
        this.containers = GameContainer.cloneContainers(containers);
    }

}