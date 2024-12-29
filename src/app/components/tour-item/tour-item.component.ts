import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TourService } from 'src/app/services/tour.service';

@Component({
  selector: 'app-tour-item',
  templateUrl: './tour-item.component.html',
  styleUrls: ['./tour-item.component.scss']
})
export class TourItemComponent implements OnInit {

  @Input() top: string | undefined;
  @Input() left: string | undefined;
  @Input() step!: number;
  @Input() lastStep: boolean = false;
  @Output() stopTour: EventEmitter<void> = new EventEmitter<void>();

  constructor(public tourService: TourService) { }

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
    this.stopTour.emit();
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
