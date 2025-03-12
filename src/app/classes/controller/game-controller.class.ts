import { GameContainer } from "../model/game/game-container.class";

export type TBit = 0 | 1;
export type THex = 0 | 1;
export type TBinaryData = TBit[];

export class GameController {

  public static getGameCode(containers: GameContainer[]): string {
    let result: string = "";
    containers = containers.map(container => GameContainer.clone(container));
    containers.sort(GameContainer.compare);
    containers.forEach(container => result = result + GameContainer.containerToHex(container));
    return result;
  }

}
