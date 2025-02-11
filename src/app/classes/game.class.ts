import { Color } from "./model/colors.class";
import { CONTAINER_SIZE } from "./model/const.class";

class GameSourceItem {
  color: Color;
  count: number;

  constructor(color: Color) {
    this.color = color;
    this.count = CONTAINER_SIZE;
  }
}

class GameContainer {
  colors: Color[] = [];
}

class Game {
  sourceItems: GameSourceItem[] = [];
  containers: GameContainer[] = [];

  private constructor() {
  }

  static createEmptyGame(colorCount: number, containerCount: number): Game {
    const result = new Game();
    // create sourceItems
    const colorValues = Object.values(Color);
    for (let i = 0; i < colorCount; i++) {
      result.sourceItems.push(new GameSourceItem(colorValues[i]));
    }
    // create containers
    for (let i = 0; i < containerCount; i++) {
      result.containers.push(new GameContainer());
    }
    return result;
  }

}
