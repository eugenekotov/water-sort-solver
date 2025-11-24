import { Component, OnInit } from '@angular/core';
import { MainService, TView } from 'src/app/services/main.service';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

    protected readonly view: TView = 'settings';

    constructor(public mainService: MainService) { }

    ngOnInit(): void {
    }

    speedChanged(event: any) {
        const speed = Number(event);
        this.mainService.saveSpeed(speed);
    }

}
