import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-board-in-progress',
  templateUrl: './board-in-progress.component.html',
  styleUrls: ['./board-in-progress.component.scss']
})
export class BoardInProgressComponent {

  constructor(public mainService: MainService) {
  }

  cancelClick() {
    console.log("cancelClick()");
    this.mainService.solutionController.cancel();
  }

}
