import { Injectable } from '@angular/core';
import { GameSourceItems } from '../classes/model/game/game-source-items.class';
import { GameContainer } from '../classes/model/game/game-container.class';
import { getRandomInt } from '../classes/utils.class';
import { CONTAINER_SIZE, MAX_CONTAINER_COUNT } from '../classes/model/const.class';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  // setup state
  sourceItems: GameSourceItems = new GameSourceItems();
  setupContainers: GameContainer[] = []; // containers while user is setuping board
  //
  private containers: GameContainer[] = [];

  constructor() {
    this.createEmptyGame(MAX_CONTAINER_COUNT - 2, MAX_CONTAINER_COUNT);
  }

  public hasGame(): boolean {
    // TODO: change condition
    // return this.containers.length > 0 && this.sourceItems.getAvailableSourceItems().length === 0;
    return this.containers.length > 0;
  }

  public fillRandomSetup() {
    let availableSourceItems = this.sourceItems.getAvailableSourceItems();
    if (availableSourceItems.length === 0) {
      this.clearSetup();
      availableSourceItems = this.sourceItems.getAvailableSourceItems();
    }
    while (availableSourceItems.length > 0) {
      const sourceIndex = getRandomInt(0, availableSourceItems.length - 1);
      availableSourceItems[sourceIndex].count--;
      const availableContainers = this.setupContainers.filter(container => container.colors.length < CONTAINER_SIZE);
      const containerIndex = getRandomInt(0, availableContainers.length - 3);
      availableContainers[containerIndex].colors.push(availableSourceItems[sourceIndex].color);
      availableSourceItems = this.sourceItems.getAvailableSourceItems();
    }
  }

  public clearSetup() {
    this.sourceItems.clear();
    this.setupContainers.forEach(container => container.colors = []);
  }

  public setupFinished() {
    this.containers = GameContainer.cloneContainers(this.setupContainers);
  }

  public createEmptyGame(colorCount: number, containerCount: number) {
    // create sourceItems
    this.sourceItems.createItems(colorCount);
    // create containers
    this.containers = [];
    for (let i = 0; i < containerCount; i++) {
      this.containers.push(new GameContainer(i));
    }
    this.setupContainers = this.getContainers();
  }

  public createRandomGame(colorCount: number, containerCount: number) {
    this.createEmptyGame(colorCount, containerCount);
    this.fillRandomSetup();
    this.containers = GameContainer.cloneContainers(this.setupContainers);
  }

  public getContainers(): GameContainer[] {
    return this.containers.map(container => GameContainer.clone(container));
  }

}
