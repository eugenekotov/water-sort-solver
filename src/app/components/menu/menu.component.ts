import { Component } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import { MainService, TView } from 'src/app/services/main.service';

class MenuItem {
    title: string;
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
        { title: "MENU.PLAY", view: "play", disabled: false },
        { title: "MENU.CREATE", view: "setup", disabled: false },
        { title: "MENU.STAT", view: "stat", disabled: false },
        { title: "MENU.LOAD", view: "load", disabled: false },
        { title: "MENU.SETTINGS", view: "settings", disabled: false },
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
