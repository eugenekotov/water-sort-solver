import { Injectable } from '@angular/core';

export type TArrow = "up" | "right-up" | "right" | "right-down" | "down" | "left-down" | "left" | "left-up";


export class TourItem {
  top: string;
  left: string;
  width: string;
  arrow: TArrow;
  text: string;
  delay: number;
}

export class Tour {
  tourItems: TourItem[] = [];
}

@Injectable({
  providedIn: 'root'
})
export class TourService {

  tour: Tour;
  tourVisible: boolean = false;
  tourOpacity: number = 0;
  tourStep: number = 0;

  constructor() { }

  startTour(tour: Tour) {
    this.tour = tour;
    this.tourStep = 0;
    this.tourOpacity = 0;
    this.tourVisible = true;
    setTimeout(() => {
      this.tourOpacity = 0.4;
    }, 0);
  }

  stopTour() {
    setTimeout(() => {
      this.tourOpacity = 0;
      setTimeout(() => {
        this.tourVisible = false;
      }, 500);
    }, 0);
  }

}
