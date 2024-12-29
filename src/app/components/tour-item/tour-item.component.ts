import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MainService } from 'src/app/services/main.service';
import { TArrow, TourService } from 'src/app/services/tour.service';

@Component({
  selector: 'app-tour-item',
  templateUrl: './tour-item.component.html',
  styleUrls: ['./tour-item.component.scss']
})
export class TourItemComponent implements OnInit {

  @Input() top: string | undefined;
  @Input() left: string | undefined;
  @Input() width: string | undefined;
  @Input() step!: number;
  @Input() lastStep: boolean = false;
  @Input() arrow!: TArrow;

  constructor(public tourService: TourService, public mainService: MainService) { }

  ngOnInit(): void {
  }

  getStyle() {
    const result: any = {};
    if (this.top) {
      result['top'] = this.top;
    }
    if (this.left) {
      result['left'] = this.left;
    }
    if (this.width) {
      result['width'] = this.width;
    }
    return result;
  }

  getArrayStyle() {
    const result: any = {};
    if (this.top) {
      result['top'] = this.top;
    }
    if (this.left) {
      result['left'] = this.left;
    }
    return result;
  }

  _stopTour() {
    this.tourService.stopTour();
  }

  _next() {
    if (!this.lastStep) {
      this.tourService.tourStep++;
    }
  }

  _prior () {
    this.tourService.tourStep--;
  }

}
