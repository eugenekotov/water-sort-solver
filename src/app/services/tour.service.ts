import { Injectable } from '@angular/core';

export type TArrow = "up" | "right-up" | "right" | "right-down" | "down" | "left-down" | "left" | "left-up";

export class TourItem {
  top: number;
  left: number;
  width: number;
  arrow: TArrow;
  text: string;
  delay: number;
  opacity: number = 0;
  element: HTMLElement;
}

export class Tour {
  tourItems: TourItem[] = [];
}

@Injectable({
  providedIn: 'root'
})
export class TourService {

  readonly TOUR_ITEM_OPACITY = 0.9;

  tour: Tour | undefined;
  tourVisible: boolean = false;
  tourOpacity: number = 0;
  tourStep: number | undefined = undefined;

  blockTop: number = 0;
  blockLeft: number = 0;
  blockWidth: number = 0;
  blockHeight: number = 0;

  wholeWidth: number = 0;
  wholeHeight: number = 0;

  constructor() { }

  startTour(tour: Tour) {
    this.tour = tour;
    this.tourStep = undefined;
    this.tourOpacity = 0;
    this.tourVisible = true;
    setTimeout(() => {
      this.tourOpacity = 0.4;
      setTimeout(() => {
        this.tourStep = 0;
        this.showItem(this.getCurrentItem());
      }, 500);
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

  private getCurrentItem(): TourItem {
    return this.tour!.tourItems[this.tourStep!];
  }

  firstStep(): boolean {
    return this.tourStep === 0;
  }

  next() {
    setTimeout(() => {
      this.hideItem(this.getCurrentItem());
      setTimeout(() => {
        this.tourStep!++;
        this.showItem(this.getCurrentItem());
      }, 0);
    }, 0);
  }

  prior() {
    setTimeout(() => {
      this.hideItem(this.getCurrentItem());
      setTimeout(() => {
        this.tourStep!--;
        this.showItem(this.getCurrentItem());
      }, 0);
    }, 0);
  }

  lastStep(): boolean {
    return this.tour !== undefined && this.tourStep === (this.tour.tourItems?.length - 1);
  }

  private hideItem(item: TourItem) {
    item.opacity = 0;
  }

  private showItem(item: TourItem) {
    setTimeout(() => {
      this.setElementsPositions(item.element);
      setTimeout(() => item.opacity = this.TOUR_ITEM_OPACITY, 0);
    }, 0);
  }

  // TODO: handle changing browser zoom
  private setElementsPositions(element: HTMLElement) {
    const tourElement = document.getElementById("tour")!;
    const tourRect: DOMRect = tourElement.getBoundingClientRect();
    this.wholeWidth = tourRect.width;
    this.wholeHeight = tourRect.height;

    const rect: DOMRect = element.getBoundingClientRect();
    const indent = 5;
    this.blockTop = rect.top - indent;
    this.blockLeft = rect.left - indent;
    this.blockWidth = rect.width + indent * 2;
    this.blockHeight = rect.height + indent * 2;


    setTimeout(() => {
      const tourItemElement = document.getElementById("item-" + this.tourStep!)!;
      const tourItemRect: DOMRect = tourItemElement.getBoundingClientRect();
      console.log(tourItemRect);
      this.tour!.tourItems[this.tourStep!].top = this.blockTop - tourItemRect.height;
      this.tour!.tourItems[this.tourStep!].left = this.blockLeft;
    }, 0);


  }

}
