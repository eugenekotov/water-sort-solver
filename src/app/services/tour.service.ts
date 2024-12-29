import { Injectable } from '@angular/core';

export class Tour {

}

@Injectable({
  providedIn: 'root'
})
export class TourService {


  tourVisible: boolean = true;
  tourStep: number = 0;

  constructor() { }

  startTour() {
    this.tourStep = 0;
    this.tourVisible = true;
  }

  stopTour() {
    this.tourVisible = false;
  }

}
