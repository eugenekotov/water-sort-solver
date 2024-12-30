import { Injectable } from '@angular/core';

export type TArrow = "up" | "right-up" | "right" | "right-down" | "down" | "left-down" | "left" | "left-up";

export class TourItem {
  top: string;
  left: string;
  width: string;
  arrow: TArrow;
  text: string;
  delay: number;
  element: HTMLElement;
}

export class Tour {
  tourItems: TourItem[] = [];
}

@Injectable({
  providedIn: 'root'
})
export class TourService {

  tour: Tour | undefined;
  tourVisible: boolean = false;
  tourOpacity: number = 0;
  tourStep: number | undefined = 0;

  top: number;
  left: number;
  width: number;
  height: number;

  wholeWidth: number;
  wholeHeight: number;

  constructor() { }

  startTour(tour: Tour) {
    this.tour = tour;
    this.tourStep = undefined;
    this.tourOpacity = 0;
    this.tourVisible = true;
    setTimeout(() => {
      this.tourOpacity = 0.4;
      setTimeout(()=>{
        this.tourStep = 0;
        this.getRect(this.tour!.tourItems[this.tourStep].element);
      },500);
    }, 0);
  }

  stopTour() {
    setTimeout(() => {
      this.tourOpacity = 0;
      setTimeout(() => {
        this.tourVisible = false;
        this.tour = undefined;
      }, 500);
    }, 0);
  }


  firstStep(): boolean {
    return this.tourStep === 0;
  }

  next() {
    this.tourStep!++;
  }

  prior() {
    this.tourStep!--;
  }

  lastStep(): boolean {
    return this.tour !== undefined && this.tourStep === (this.tour.tourItems?.length - 1);
  }

  private getRect(element: HTMLElement) {

    const element2 = document.getElementById("tour")!;
    const rect2: DOMRect = element2.getBoundingClientRect();
    console.log(rect2);
    this.wholeWidth = rect2.width;
    this.wholeHeight = rect2.height;

    const rect: DOMRect = element.getBoundingClientRect();
    this.top = rect.top;
    this.left = rect.left;
    this.width = rect.width;
    this.height = rect.height;
  }

}
