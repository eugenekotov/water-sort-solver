import { Component, OnInit } from '@angular/core';
import { MainService, TView } from 'src/app/services/main.service';

@Component({
  selector: 'app-load-game',
  templateUrl: './load-game.component.html',
  styleUrls: ['./load-game.component.scss']
})
export class LoadGameComponent implements OnInit {

  protected readonly view: TView = 'load';

  constructor(public mainService: MainService) { }

  ngOnInit(): void {
  }

  onLoadClick() {

  }

}
