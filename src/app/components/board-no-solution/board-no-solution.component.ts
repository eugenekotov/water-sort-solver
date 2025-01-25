import { Component, OnInit } from '@angular/core';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-board-no-solution',
  templateUrl: './board-no-solution.component.html',
  styleUrls: ['./board-no-solution.component.scss']
})
export class BoardNoSolutionComponent {

  constructor(public mainService: MainService) {
  }

  setupClick() {
    this.mainService.setView("setup");
  }

}
