import { Injectable } from '@angular/core';
import { CONTAINER_SIZE, MAX_CONTAINER_COUNT } from '../classes/model/const.class';
import { GameContainer } from '../classes/model/game/game-container.class';
import { GameSourceItems } from '../classes/model/game/game-source-items.class';
import { getRandomInt } from '../classes/utils.class';
import { TGameView } from './main.service';
import { PlayStep } from '../components/board-play/board-play.component';
import { State } from '../classes/model/state.class';
import { Solution } from '../classes/model/solution-set.class';
import { GameController } from '../classes/controller/game-controller.class';
import { StatisticsService } from './statistics.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  gameView: TGameView | undefined;
  // setup
  gameSourceItems: GameSourceItems = new GameSourceItems();
  setupContainers: GameContainer[] = []; // containers while user is setuping board
  // play
  playContainers: GameContainer[] = [];
  steps: PlayStep[] = [];
  // solve
  solveContainers: GameContainer[] = [];
  solution: Solution | undefined;
  completeStepIndex: number = 0;
  //
  private containers: GameContainer[] = [];

  constructor(private statisticsService: StatisticsService) {
    this.createRandomGame(MAX_CONTAINER_COUNT - 2, MAX_CONTAINER_COUNT);
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
      availableContainers[containerIndex].push(availableSourceItems[sourceIndex].color);
      availableSourceItems = this.gameSourceItems.getAvailableSourceItems();
    }
  }

  public clearSetup() {
    this.gameSourceItems.clear();
    this.setupContainers.forEach(container => container.clear());
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
    this.gameSourceItems.createSourceItems(colorCount);
    // create containers
    this.containers = [];
    for (let i = 0; i < containerCount; i++) {
      this.containers.push(new GameContainer(i));
    }
    this.steps = [];
    // create setupContainers
    this.setupContainers = this.getContainers();
  }

  public createRandomGame(colorCount: number, containerCount: number) {
    let attempts = 0;
    colorCount = 2;
    containerCount = 4;
    do {
      attempts++;
      console.log("attemps", attempts);
      this.createEmptyGame(colorCount, containerCount);
      this.fillRandomSetup();
      const hash = GameController.getGameHash(this.setupContainers);
      const b = this.statisticsService.hasHash(hash);
      console.log("res", b);
      // TODO: BUG it doesn't work
    } while (this.statisticsService.hasHash(GameController.getGameHash(this.setupContainers)) && attempts < 10000);
    if (attempts >= 10000) {
      // TODO: Handle case
      console.error("Cannot build new board.");
    }
    this.fromSetupContainersToContainers();
    this.playContainers = this.getContainers();
  }

  public getContainers(): GameContainer[] {
    return GameContainer.cloneContainers(this.containers);
  }

  public setContainers(containers: GameContainer[]): void {
    this.containers = GameContainer.cloneContainers(containers);
  }

  public getState(): State {
    const state = new State(this.gameView!, this.getContainers());
    // setup
    state.setupSourceItems = this.gameSourceItems.sourceItems;
    // play
    state.playContainers = this.playContainers;
    state.steps = this.steps;
    // solve
    state.solveContainers = this.solveContainers;
    state.solution = this.solution;
    state.completeStepIndex = this.completeStepIndex;
    //
    return state;
  }


}
