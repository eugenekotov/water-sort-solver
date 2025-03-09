import { Component, OnInit } from '@angular/core';
import { MainService, TView } from 'src/app/services/main.service';

@Component({
  selector: 'app-save-game',
  templateUrl: './save-game.component.html',
  styleUrls: ['./save-game.component.scss']
})
export class SaveGameComponent implements OnInit {

  protected readonly view: TView = 'save';

  constructor(public mainService: MainService) { }

  ngOnInit(): void {
  }

}
