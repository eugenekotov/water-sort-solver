import { Component } from '@angular/core';
import { MainService, TView } from 'src/app/services/main.service';

class MenuItem {
  title_param: string;
  view: TView;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {

  menu: MenuItem[] = [
    { title_param: "MENU.PLAY", view: "play" },
    { title_param: "MENU.CREATE", view: "setup" },
    { title_param: "MENU.SOLVE", view: "solve" },
    { title_param: "MENU.SETTINGS", view: "settings" }
  ];

  constructor(public mainService: MainService) { }

  onClick(item: MenuItem) {
    this.mainService.setView(item.view);
  }

}
