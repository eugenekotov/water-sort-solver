import { GameContainer } from "../model/game/game-container.class";

export type TBit = 0 | 1;
export type THex = 0 | 1;
export type TBinaryData = TBit[];

export class GameController {

  /**
   * @returns Game Hash - hex code which contains sorted containers with colors.
   * The hash can be used to compare games.
   */
  public static getGameHash(containers: GameContainer[]): string {
    let result: string = "";
    containers = GameContainer.cloneContainers(containers);
    containers.sort(GameContainer.compare);
    containers.forEach(container => result = result + GameContainer.containerToHex(container));
    return result;
  }

}
