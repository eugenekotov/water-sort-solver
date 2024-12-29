import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MainService } from 'src/app/services/main.service';
import { TArrow, TourItem, TourService } from 'src/app/services/tour.service';

@Component({
  selector: 'app-tour-item',
  templateUrl: './tour-item.component.html',
  styleUrls: ['./tour-item.component.scss']
})
export class TourItemComponent implements OnInit {

  @Input() index: number;
  @Input() item: TourItem;

  constructor(public tourService: TourService, public mainService: MainService) { }

  ngOnInit(): void {
  }

  getStyle() {
    const result: any = {};
    result['top'] = this.item.top;
    result['left'] = this.item.left;
    result['width'] = this.item.width;
    return result;
  }

  _stopTour() {
    this.tourService.stopTour();
  }

  _next() {
    if (!this.lastStep()) {
      this.tourService.tourStep++;
    }
  }

  _prior() {
    if (!this.firstStep()) {
      this.tourService.tourStep--;
    }
  }


  firstStep(): boolean {
    return this.tourService.tourStep === 0;
  }

  lastStep(): boolean {
    return this.tourService.tourStep === this.tourService.tour.tourItems.length - 1;
  }

}
