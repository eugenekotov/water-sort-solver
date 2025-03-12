import { Color } from "../colors.class";
import { CONTAINER_SIZE } from "../const.class";
import { getRandomInt } from "../../utils.class";
import { GameSourceItem } from "./game-source-item.class";
import { GameContainer } from "./game-container.class";

export class Game {

  sourceItems: GameSourceItem[] = [];
  containers: GameContainer[] = [];

  private constructor() {
  }

  fillRandom() {
    let availableSourceItems = this.getAvailableSourceItems();
    if (availableSourceItems.length === 0) {
      this.clear();
      availableSourceItems = this.getAvailableSourceItems();
    }
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
      result.containers.push(new GameContainer(i));
    }
    return result;
  }

  static createRandomGame(colorCount: number, containerCount: number): Game {
    const result = this.createEmptyGame(colorCount, containerCount);
    result.fillRandom();
    return result;
  }

  public getClonedContainers(): GameContainer[] {
    return this.containers.map(container => GameContainer.clone(container));
  }

}
