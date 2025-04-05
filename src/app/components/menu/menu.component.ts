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

  constructor(public mainService: MainService, public gameService: GameService, public dialog: MatDialog) { }

  protected onClick(item: MenuItem) {
    this.mainService.setView(item.view);
  }

  protected itemDisabled(item: MenuItem) {
    return typeof item.disabled === 'function' ? item.disabled() : item.disabled;
  }

  protected openDialog(): void {

    const config: MatDialogConfig = {
      data: {text: "This is text." },
      width: '400px',
      height: '300px',
      disableClose: true,
    };

    const dialogRef = this.dialog.open(PlayedDialogComponent, config);

    dialogRef.afterClosed().subscribe((result: PlayedDialogResult) => {
      console.log('The dialog was closed', result);
      if (result.view === 'play') {
        this.gameService.createRandomGame(MAX_CONTAINER_COUNT - 2, MAX_CONTAINER_COUNT);
      }
      this.mainService.setView(result.view);
    });
  }

}
