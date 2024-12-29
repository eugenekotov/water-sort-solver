import { Component, OnInit } from '@angular/core';
import { TourService } from 'src/app/services/tour.service';

@Component({
  selector: 'app-tour',
  templateUrl: './tour.component.html',
  styleUrls: ['./tour.component.scss']
})
export class TourComponent implements OnInit {

  constructor(public tourService: TourService) { }

  ngOnInit(): void {
  }

}
