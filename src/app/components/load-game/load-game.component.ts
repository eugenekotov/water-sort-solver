import { Component, OnInit } from '@angular/core';
import { STORAGE_KEY } from 'src/app/classes/model/const.class';
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
    this.gameService.gameView = state.view;
    this.gameService.setContainers(state.containers);
    this.gameService.gameSourceItems.sourceItems = state.setupSourceItems;
    this.gameService.fromContainersToSetupContainers();

    this.mainService.setView(state.view!);
  }

}
