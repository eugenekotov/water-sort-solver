import { Component, OnInit } from '@angular/core';
import { MainService, TView } from 'src/app/services/main.service';

@Component({
    selector: 'app-board-no-solution',
    templateUrl: './board-no-solution.component.html',
    styleUrls: ['./board-no-solution.component.scss']
})
export class BoardNoSolutionComponent {

    protected view: TView = "no-solution";
    constructor(public mainService: MainService) {
    }

    setupClick() {
        this.mainService.setView("setup");
    }

}
