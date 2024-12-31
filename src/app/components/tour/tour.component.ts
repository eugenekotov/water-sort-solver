import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Tour, TourService } from 'src/app/services/tour.service';

@Component({
  selector: 'app-tour',
  templateUrl: './tour.component.html',
  styleUrls: ['./tour.component.scss']
})
export class TourComponent {

  constructor(public tourService: TourService) { }

}
