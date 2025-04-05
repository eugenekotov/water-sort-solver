import { Component } from '@angular/core';
import { MainService, TView } from 'src/app/services/main.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PlayedDialogComponent, PlayedDialogResult } from '../played-dialog/played-dialog.component';
import { MAX_CONTAINER_COUNT } from 'src/app/classes/model/const.class';
import { GameService } from 'src/app/services/game.service';

class MenuItem {
  title_param: string;
  view: TView;
  disabled: boolean | (() => boolean);
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {

  protected readonly view: TView = 'menu';

  menu: MenuItem[] = [
    { title_param: "MENU.PLAY", view: "play", disabled: false },
    { title_param: "MENU.CREATE", view: "setup", disabled: false },
    // { title_param: "MENU.SOLVE", view: "solve", disabled: false },
    // { title_param: "MENU.SAVE", view: "save", disabled: false },
    { title_param: "MENU.LOAD", view: "load", disabled: false },
    { title_param: "MENU.SETTINGS", view: "settings", disabled: false }
  ];

  constructor(public mainService: MainService, public gameService: GameService) {
    this.gameService.gameView = undefined;
  }

  protected onClick(item: MenuItem) {
    this.mainService.setView(item.view);
  }

  protected itemDisabled(item: MenuItem) {
    return typeof item.disabled === 'function' ? item.disabled() : item.disabled;
  }

}
