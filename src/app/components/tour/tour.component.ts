import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Tour, TourService } from 'src/app/services/tour.service';

@Component({
  selector: 'app-tour',
  templateUrl: './tour.component.html',
  styleUrls: ['./tour.component.scss']
})
export class TourComponent {

  constructor(public tourService: TourService) { }

  getBlockStyle() {
    // TODO: handle changing browser zoom
    return {
      top: this.tourService.top + 'px',
      left: this.tourService.left + 'px',
      width: this.tourService.width + 'px',
      height: this.tourService.height + 'px'
    };
  }

}
