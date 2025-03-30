import { Injectable } from '@angular/core';
import { CONTAINER_SIZE, MAX_CONTAINER_COUNT } from '../classes/model/const.class';
import { GameContainer } from '../classes/model/game/game-container.class';
import { GameSourceItems } from '../classes/model/game/game-source-items.class';
import { getRandomInt } from '../classes/utils.class';
import { TGameView } from './main.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  gameView: TGameView | undefined;
  // setup state
  gameSourceItems: GameSourceItems = new GameSourceItems();
  setupContainers: GameContainer[] = []; // containers while user is setuping board
  //
  private containers: GameContainer[] = [];

  constructor() {
    this.createEmptyGame(MAX_CONTAINER_COUNT - 2, MAX_CONTAINER_COUNT);
  }

  public hasGame(): boolean {
    return this.containers.length > 0 && this.containers.some(container => container.colors.length > 0);
  }

  public fillRandomSetup() {
    let availableSourceItems = this.gameSourceItems.getAvailableSourceItems();
    if (availableSourceItems.length === 0) {
      this.clearSetup();
      availableSourceItems = this.gameSourceItems.getAvailableSourceItems();
    }
    while (availableSourceItems.length > 0) {
      const sourceIndex = getRandomInt(0, availableSourceItems.length - 1);
      availableSourceItems[sourceIndex].count--;
      const availableContainers = this.setupContainers.filter(container => container.colors.length < CONTAINER_SIZE);
      const containerIndex = getRandomInt(0, availableContainers.length - 3);
      availableContainers[containerIndex].colors.push(availableSourceItems[sourceIndex].color);
      availableSourceItems = this.gameSourceItems.getAvailableSourceItems();
    }
  }

  public clearSetup() {
    this.gameSourceItems.clear();
    this.setupContainers.forEach(container => container.colors = []);
  }

  public fromSetupContainersToContainers(): void {
    this.containers = this.setupContainers.map(container => {
      const newContainer = GameContainer.clone(container);
      newContainer.colors = newContainer.colors.reverse();
      return newContainer;
    });
  }

  public fromContainersToSetupContainers(): void {
    this.setupContainers = this.containers.map(container => {
      const newContainer = GameContainer.clone(container);
      newContainer.colors = newContainer.colors.reverse();
      return newContainer;
    });
  }

  public createEmptyGame(colorCount: number, containerCount: number) {
    // create sourceItems
    this.gameSourceItems.createItems(colorCount);
    // create containers
    this.containers = [];
    for (let i = 0; i < containerCount; i++) {
      this.containers.push(new GameContainer(i));
    }
    // create setupContainers
    this.setupContainers = this.getContainers();
  }

  public createRandomGame(colorCount: number, containerCount: number) {
    this.createEmptyGame(colorCount, containerCount);
    this.fillRandomSetup();
    this.fromSetupContainersToContainers();
  }

  public getContainers(): GameContainer[] {
    return GameContainer.cloneContainers(this.containers);
  }

  public setContainers(containers: GameContainer[]): void {
    this.containers = GameContainer.cloneContainers(containers);
  }


}
