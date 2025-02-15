import { Color } from "./model/colors.class";
import { CONTAINER_SIZE } from "./model/const.class";
import { getRandomInt } from "./utils.class";

export class GameSourceItem {
  color: Color;
  count: number;

  constructor(color: Color) {
    this.color = color;
    this.count = CONTAINER_SIZE;
  }
}

export class GameContainer {
  colors: Color[] = [];

  static equal(container1: GameContainer, container2: GameContainer): boolean {
    if (container1.colors.length !== container2.colors.length) {
      return false;
    }
    for (let i = 0; i < container1.colors.length; i++) {
      if (container1.colors[i] !== container2.colors[i]) {
        return false;
      }
    }
    return true;
  }
}

export class Game {

  sourceItems: GameSourceItem[] = [];
  containers: GameContainer[] = [];

  private constructor() {
  }

  fillRandom() {
    let availableSourceItems = this.getAvailableSourceItems();
    while (availableSourceItems.length > 0) {
      const sourceIndex = getRandomInt(0, availableSourceItems.length - 1);
      availableSourceItems[sourceIndex].count--;
      const availableContainers = this.containers.filter(container => container.colors.length < CONTAINER_SIZE);
      const containerIndex = getRandomInt(0, availableContainers.length - 3);
      availableContainers[containerIndex].colors.push(availableSourceItems[sourceIndex].color);
      availableSourceItems = this.getAvailableSourceItems();
    }
  }

  private getAvailableSourceItems(): GameSourceItem[] {
    return this.sourceItems.filter(item => item.count > 0);
  }

  clear() {
    this.sourceItems.forEach(item => item.count = CONTAINER_SIZE);
    this.containers.forEach(container => container.colors = []);
  }

  addSourceItems(count: number) {
    const colorValues = Object.values(Color);
    const indexFrom = this.sourceItems.length
    for (let i = indexFrom; i < indexFrom + count; i++) {
      this.sourceItems.push(new GameSourceItem(colorValues[i]));
    }
  }

  getSourceItem(color: Color): GameSourceItem {
    const items = this.sourceItems.filter(item => item.color === color);
    if (items.length !== 1) {
      throw new Error("Cannot find source item by color");
    }
    return items[0];
  }

  static createEmptyGame(colorCount: number, containerCount: number): Game {
    const result = new Game();
    // create sourceItems
    result.addSourceItems(colorCount);
    // create containers
    for (let i = 0; i < containerCount; i++) {
      result.containers.push(new GameContainer());
    }
    return result;
  }

  static createRandomGame(colorCount: number, containerCount: number): Game {
    const result = this.createEmptyGame(colorCount, containerCount);
    result.fillRandom();
    return result;
  }

}
