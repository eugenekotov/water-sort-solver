import { Component } from '@angular/core';
import { MainService, TView } from 'src/app/services/main.service';

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
    { title_param: "MENU.SOLVE", view: "solve", disabled: false },
    { title_param: "MENU.SAVE", view: "save", disabled: () => this.mainService.game !== undefined },
    { title_param: "MENU.LOAD", view: "load", disabled: false },
    { title_param: "MENU.SETTINGS", view: "settings", disabled: false }
  ];

  constructor(public mainService: MainService) { }

  protected onClick(item: MenuItem) {
    this.mainService.setView(item.view);
  }

  protected itemDisabled(item: MenuItem) {
    return typeof item.disabled === 'function' ? item.disabled() : item.disabled;
  }

}
