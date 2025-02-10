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
    const viewBeforeSettings = this.mainService.viewBeforeSettings;
    this.mainService.viewBeforeSettings = undefined;
    this.mainService.setView(viewBeforeSettings !== undefined ? viewBeforeSettings : "menu");
  }

  speedChanged(event: any) {
    const speed = Number(event);
    this.mainService.saveSpeed(speed);
  }

}
