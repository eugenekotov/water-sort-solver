import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';


type TMode = undefined | "setup" | "solve";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'water-sort-solver';

  mode: TMode;

  setupClick() {
    this.mode = "setup";
  }

  solveClick() {
    this.mode = "solve";
  }

}
