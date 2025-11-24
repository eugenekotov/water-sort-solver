import { Component, Input } from '@angular/core';
import { MainService } from 'src/app/services/main.service';
import { TourItem, TourService } from 'src/app/services/tour.service';

@Component({
  selector: 'app-tour-item',
  templateUrl: './tour-item.component.html',
  styleUrls: ['./tour-item.component.scss']
})
export class TourItemComponent {

  @Input() index: number;
  @Input() item: TourItem;

  constructor(public tourService: TourService, public mainService: MainService) { }

}
