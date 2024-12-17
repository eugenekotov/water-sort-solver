import { AfterViewInit, Component } from '@angular/core';
import { MainService } from './services/main.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  constructor(public mainService: MainService) {
  }

  ngAfterViewInit(): void {
    this.mainService.setMode("setup");
  }

}
