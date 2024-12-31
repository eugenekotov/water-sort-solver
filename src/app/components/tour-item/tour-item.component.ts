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
    result['top'] = this.item.top + 'px';
    result['left'] = this.item.left + 'px';
    result['width'] = this.item.width + 'px';
    result['opacity'] = this.item.opacity;
    result['transition'] = 'opacity 1.5s ease-in-out';
    return result;
  }

}
