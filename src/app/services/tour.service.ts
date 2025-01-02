import { Injectable } from '@angular/core';
import { getRandomInt } from '../classes/utils.class';

type TPositionX = "right" | "right-half" | "left" | "left-half";
type TPositionY = "above" | "above-half" | "below" | "below-half";

class TPosition {

  constructor(public x: TPositionX | undefined, public y: TPositionY | undefined) { }

  equals(position: TPosition): boolean {
    return this.x === position.x && this.y === position.y;
  }

}

export class Rect {

  top: number;
  left: number;
  width: number;
  height: number;

  setDomRect(rect: DOMRect): Rect {
    this.top = rect.top;
    this.left = rect.left;
    this.width = rect.width;
    this.height = rect.height;
    return this;
  }

  set(top: number, left: number, width: number, height: number): Rect {
    this.top = top;
    this.left = left;
    this.width = width;
    this.height = height;
    return this;
  }

}

export class TourItem {
  top: number;
  left: number;
  width: number;
  text: string;
  delay: number;
  opacity: number = 0;
  element: HTMLElement;

  setWidth(width: number): TourItem {
    this.width = width;
    return this;
  }

  setText(text: string): TourItem {
    this.text = text;
    return this;
  }

  setElement(element: HTMLElement): TourItem {
    this.element = element;
    return this;
  }

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

  mainRect: Rect = new Rect();
  blockRect: Rect = new Rect();

  arrowTop: number = 0;
  arrowLeft: number = 0;

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

  terminateTour() {
    console.log("terminateTour!");
    this.tourVisible = false;
    setTimeout(() => {
      this.tour = undefined;
      this.tourOpacity = 0;
      this.arrowOpacity = 0;
    }, 0);
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
    setTimeout(() => {
      this.calculatePositions(item.element);
      this.tourOpacity = this.TOUR_OPACITY;
      this.arrowOpacity = this.ARROW_OPACITY;
      item.opacity = this.TOUR_ITEM_OPACITY;
    }, 0);
  }

  // TODO: handle changing browser zoom
  private calculatePositions(element: HTMLElement) {
    this.mainRect = this.getMainRect();
    this.blockRect = this.getBlockRect(element);
    const arrowRect = this.getArrowRect();
    setTimeout(() => {
      const itemRect = this.getItemRect();
      const position = this.getItemPosition(itemRect, arrowRect, this.mainRect);
      console.log(position);
      // set Position
      switch (position.x) {
        case undefined:
          itemRect.left = this.blockRect.left + this.blockRect.width / 2 - itemRect.width / 2;
          break;

        case "left":
          itemRect.left = this.blockRect.left - itemRect.width - arrowRect.width;
          break;

        case "left-half":
          itemRect.left = this.blockRect.left - itemRect.width / 2;
          break;

        case "right":
          itemRect.left = this.blockRect.left + this.blockRect.width + arrowRect.width;
          break;

        case "right-half":
          itemRect.left = this.blockRect.left + this.blockRect.width - itemRect.width / 2;
          break;
        default:
          const _n: never = position.x;
          break;
      }

      switch (position.y) {
        case undefined:
          itemRect.top = this.blockRect.top + this.blockRect.height / 2 - itemRect.height / 2;
          break;
        case "above":
          itemRect.top = this.blockRect.top - itemRect.height - arrowRect.height;
          break;
        case "above-half":
          itemRect.top = this.blockRect.top - (itemRect.height + arrowRect.height) / 2;
          break;
        case "below":
          itemRect.top = this.blockRect.top + this.blockRect.height + arrowRect.height;
          break;
        case "below-half":
          itemRect.top = this.blockRect.top + this.blockRect.height + (itemRect.height + arrowRect.height) / 2;
          break;
        default:
          const _n: never = position.y;
          break;
      }
      //
      this.getCurrentItem().top = itemRect.top;
      this.getCurrentItem().left = itemRect.left;
    }, 0);
  }

  private getMainRect(): Rect {
    const tourElement = document.getElementById("tour")!;
    const tourDocRect: DOMRect = tourElement.getBoundingClientRect();
    return new Rect().set(0, 0, tourDocRect.width, tourDocRect.height)
  }

  private getBlockRect(element: HTMLElement): Rect {
    const rect: DOMRect = element.getBoundingClientRect();
    const blockIndent = 5;
    return new Rect().set(rect.top - blockIndent, rect.left - blockIndent, rect.width + blockIndent * 2, rect.height + blockIndent * 2);
  }

  private getArrowRect(): Rect {
    const arrowElement = document.getElementById("arrow")!;
    const arrowDomRect: DOMRect = arrowElement.getBoundingClientRect();
    return new Rect().setDomRect(arrowDomRect);
  }

  private getItemRect(): Rect {
    const tourItemElement = document.getElementById("item-" + this.tourStep!)!;
    const tourItemRect: DOMRect = tourItemElement.getBoundingClientRect();
    return new Rect().set(this.blockRect.top - tourItemRect.height, this.blockRect.left, tourItemRect.width, tourItemRect.height);
  }

  private getItemPosition(itemRect: Rect, arrowRect: Rect, mainRect: Rect): TPosition {
    // Looking for position
    const positionsX = new Set<TPositionX>();
    const positionsY = new Set<TPositionY>();
    if (this.blockRect.top > itemRect.height + arrowRect.height) {
      positionsY.add("above");
    }
    if (this.blockRect.top > (itemRect.height + arrowRect.height) / 2) {
      positionsY.add("above-half");
    }
    if (mainRect.height - this.blockRect.top - this.blockRect.height > itemRect.height + arrowRect.height) {
      positionsY.add("below");
    }
    if (mainRect.height - this.blockRect.top - this.blockRect.height > (itemRect.height + arrowRect.height) / 2) {
      positionsY.add("below-half");
    }
    if (this.blockRect.left > itemRect.width + arrowRect.width) {
      positionsX.add("left");
    }
    if (this.blockRect.left > (itemRect.width + arrowRect.width) / 2) {
      positionsX.add("left-half");
    }
    if (mainRect.width - this.blockRect.left - this.blockRect.width > itemRect.width + arrowRect.width) {
      positionsX.add("right");
    }
    if (mainRect.width - this.blockRect.left - this.blockRect.width > (itemRect.width + arrowRect.width) / 2) {
      positionsX.add("right-half");
    }

    const positions: TPosition[] = [];
    positionsX.forEach(posX => {
      if (posX === "left" || posX === "right") {
        positions.push(new TPosition(posX, undefined));
        positionsY.forEach(posY => positions.push(new TPosition(posX, posY)));
      }
    });

    positionsY.forEach(posY => {
      if (posY === "above" || posY === "below") {
        positions.push(new TPosition(undefined, posY));
        positionsX.forEach(posX => {
          const position = new TPosition(posX, posY);
          if (!positions.some(pos => pos.equals(position))) {
            positions.push(new TPosition(posX, posY));
          }
        });
      }
    });
    // Let chose position randomly
    const positionIndex = getRandomInt(0, positions.length - 1);
    return positions[positionIndex];
  }


  getTourStyle() {
    return {
      'transition': 'opacity ' + this.TOUR_DELAY + 'ms ease-in-out',
      'opacity': this.tourOpacity
    };
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
    result['top'] = this.arrowTop + 'px';
    result['left'] = this.arrowLeft + 'px';
    result['opacity'] = this.arrowOpacity;
    result['transition'] = 'opacity ' + this.TOUR_DELAY + 'ms ease-in-out';
    return result;
  }

}
