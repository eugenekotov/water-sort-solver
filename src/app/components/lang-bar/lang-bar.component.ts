import { Component, OnInit } from '@angular/core';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-lang-bar',
  templateUrl: './lang-bar.component.html',
  styleUrls: ['./lang-bar.component.scss']
})
export class LangBarComponent {

  constructor(public mainService: MainService) { }

  selectUk() {
    this.mainService.changeLanguage("uk");
  }

  selectEn() {
    this.mainService.changeLanguage("en");
  }

}
