import { Component, OnInit } from '@angular/core';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(public mainService: MainService) { }

  ngOnInit(): void {
  }

  onBackClick() {
    this.mainService.setView("menu");
  }

}
