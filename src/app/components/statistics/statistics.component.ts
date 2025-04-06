import { Component, OnInit } from '@angular/core';
import { MainService, TView } from 'src/app/services/main.service';

@Component({
    selector: 'app-statistics',
    templateUrl: './statistics.component.html',
    styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

    protected readonly view: TView = 'stat';

    constructor(public mainService: MainService) {
    }

    ngOnInit(): void {
    }

}
