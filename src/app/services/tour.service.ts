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

  readonly TOUR_OPACITY = 0.4;
  readonly TOUR_DELAY = 500;
  readonly TOUR_ITEM_OPACITY = 0.9;
  readonly ARROW_OPACITY = 0.9;

  tour: Tour | undefined;
  tourVisible: boolean = false;
  tourOpacity: number = 0;
  arrowOpacity: number = 0;
  tourStep: number | undefined = undefined;


  itemTop: number = 0;
  itemLeft: number = 0;

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
    this.tourVisible = true;
    setTimeout(() => {
      this.tourOpacity = this.TOUR_OPACITY;
      this.arrowOpacity = this.ARROW_OPACITY
      this.tourStep = 0;
      this.showItem(this.getCurrentItem());
    }, 0);
  }

  stopTour() {
    this.hideItem(this.getCurrentItem()).then(() => {
      setTimeout(() => {
        this.tourVisible = false;
        this.tour = undefined;
      }, this.TOUR_DELAY);
    });
  }

  getCurrentItem(): TourItem {
    return this.tour!.tourItems[this.tourStep!];
  }

  firstStep(): boolean {
    return this.tourStep === 0;
  }

  next() {
    this.hideItem(this.getCurrentItem()).then(() => {
      setTimeout(() => {
        this.tourStep!++;
        this.showItem(this.getCurrentItem());
      }, 0);
    });
  }

  prior() {
    this.hideItem(this.getCurrentItem()).then(() => {
      setTimeout(() => {
        this.tourStep!--;
        this.showItem(this.getCurrentItem());
      }, 0);
    });
  }

  lastStep(): boolean {
    return this.tour !== undefined && this.tourStep === (this.tour.tourItems?.length - 1);
  }

  private hideItem(item: TourItem): Promise<void> {
    return new Promise<void>(resolve => {
      item.opacity = 0;
      this.tourOpacity = 0;
      this.arrowOpacity = 0;
      setTimeout(() => resolve(), this.TOUR_DELAY);
    }
    );
  }

  private showItem(item: TourItem) {
    this.setElementsPositions(item.element);
    setTimeout(() => {
      this.tourOpacity = this.TOUR_OPACITY;
      this.arrowOpacity = this.ARROW_OPACITY;
      item.opacity = this.TOUR_ITEM_OPACITY;
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

      this.itemTop = this.blockTop - tourItemRect.height;
      this.itemLeft = this.blockLeft;

      this.tour!.tourItems[this.tourStep!].top = this.itemTop;
      this.tour!.tourItems[this.tourStep!].left = this.itemLeft;
    }, 0);
  }

  getItemStyle() {
    const result: any = {};
    const item = this.getCurrentItem();
    result['top'] = item.top + 'px';
    result['left'] = item.left + 'px';
    result['width'] = item.width + 'px';
    result['opacity'] = item.opacity;
    result['transition'] = 'opacity ' + this.TOUR_DELAY + 'ms ease-in-out';
    return result;
  }

  getArrowStyle() {
    const result: any = {};
    result['top'] = this.blockTop + 'px';
    result['left'] = this.blockLeft + 'px';
    result['transition'] = 'opacity ' + this.TOUR_DELAY + 'ms ease-in-out';
    result['opacity'] = this.arrowOpacity;
    return result;
  }

}
