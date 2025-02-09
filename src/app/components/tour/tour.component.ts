import { Component } from '@angular/core';
import { MainService } from 'src/app/services/main.service';
import { TourService } from 'src/app/services/tour.service';

@Component({
  selector: 'app-tour',
  templateUrl: './tour.component.html',
  styleUrls: ['./tour.component.scss']
})
export class TourComponent {

  constructor(public mainService: MainService, public tourService: TourService) { }

}
