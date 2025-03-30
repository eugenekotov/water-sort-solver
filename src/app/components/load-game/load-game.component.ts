import { Component, OnInit } from '@angular/core';
import { STORAGE_KEY } from 'src/app/classes/model/const.class';
import { GameContainer } from 'src/app/classes/model/game/game-container.class';
import { Solution } from 'src/app/classes/model/solution-set.class';
import { State } from 'src/app/classes/model/state.class';
import { GameService } from 'src/app/services/game.service';
import { MainService, TView } from 'src/app/services/main.service';

@Component({
  selector: 'app-load-game',
  templateUrl: './load-game.component.html',
  styleUrls: ['./load-game.component.scss']
})
export class LoadGameComponent implements OnInit {

  protected readonly view: TView = 'load';

  constructor(public mainService: MainService, private gameService: GameService) { }

  ngOnInit(): void {
  }

  onLoadClick() {

    const stateString = localStorage.getItem(STORAGE_KEY + "-state");
    if (!stateString) {
      // TODO: add error message to interface
      console.error("Cannot load state");
      return;
    }
    const state: State = JSON.parse(stateString);
    // recover classes
    state.containers = state.containers.map(container => GameContainer.clone(container));
    state.playContainers = state.playContainers.map(container => GameContainer.clone(container));
    if (state.solution) {
      state.solution = Solution.clone(state.solution);
    }
    //
    this.gameService.gameView = state.view;
    this.gameService.setContainers(state.containers);
    // setup
    this.gameService.gameSourceItems.sourceItems = state.setupSourceItems;
    this.gameService.fromContainersToSetupContainers();
    // play
    this.gameService.playContainers = state.playContainers;
    this.gameService.steps = state.steps;
    // solve
    this.gameService.solveContainers = state.solveContainers;
    this.gameService.solution = state.solution;
    this.gameService.completeStepIndex = state.completeStepIndex;
    //
    this.mainService.setView(state.view!);
  }

}
