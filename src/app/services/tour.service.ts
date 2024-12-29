import { Injectable } from '@angular/core';

export type TArrow = "up" | "right-up" | "right" | "right-down" | "down" | "left-down" | "left" | "left-up";

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
