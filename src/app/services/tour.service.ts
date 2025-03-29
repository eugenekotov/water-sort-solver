import { Injectable } from '@angular/core';
import { getRandomInt } from '../classes/utils.class';

type TPositionX = "right" | "right-half" | "middle" | "left" | "left-half";
type TPositionY = "above" | "above-half" | "middle" | "below" | "below-half";

class Position {

  constructor(public x: TPositionX, public y: TPositionY) { }

  equals(position: Position): boolean {
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
  delay: number = 2000;
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

  //readonly TOUR_OPACITY = 0.4;
  readonly TOUR_OPACITY = 0.7;
  readonly TOUR_DELAY = 500;
  readonly TOUR_ITEM_OPACITY = 0.9;
  readonly ARROW_OPACITY = 1;

  tour: Tour | undefined;
  tourVisible: boolean = false;
  tourOpacity: number = 0;
  arrowOpacity: number = 0;
  arrowRotate: number = 0;
  tourStep: number | undefined = undefined;

  mainRect: Rect = new Rect();
  blockRect: Rect = new Rect();
  arrowRect: Rect = new Rect();

  constructor() { }

  startTour(tour: Tour) {
    this.tour = tour;
    this.tourStep = undefined;
    this.tourVisible = true;
    setTimeout(() => {
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
    if (this.tourVisible) {
      this.tour = undefined;
      this.tourOpacity = 0;
      this.arrowOpacity = 0;
      setTimeout(() => this.tourVisible = false, 0);
    }
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
      setTimeout(() => {
        this.tourOpacity = this.TOUR_OPACITY;
        this.arrowOpacity = this.ARROW_OPACITY;
        item.opacity = this.TOUR_ITEM_OPACITY;
      }, 0);
    }, 0);
  }

  private calculatePositions(element: HTMLElement) {
    this.mainRect = this.getMainRect();
    this.blockRect = this.getBlockRect(element);
    this.arrowRotate = 0;
    setTimeout(() => {
      this.arrowRect = this.getArrowRect();
      const itemRect = this.getItemRect();
      const position = this.calculateItemPosition(itemRect, this.arrowRect, this.mainRect);
      this.setItemPosition(position, itemRect);
      this.setArrowAngle(position);
    }, 0);
  }

  private setArrowAngle(position: Position): void {
    switch (position.x) {
      case "middle":
        switch (position.y) {
          case "middle":
            throw new Error("Cannot calculate arrow angle");
          case "above":
            this.arrowRotate = 180;
            break;
          case "above-half":
            throw new Error("Cannot calculate arrow angle");
          case "below":
            this.arrowRotate = 0;
            break;
          case "below-half":
            throw new Error("Cannot calculate arrow angle");
          default:
            const _n: never = position.y;
            break;
        }
        break;

      case "left":
        switch (position.y) {
          case "middle":
            this.arrowRotate = 90;
            break;
          case "above":
            this.arrowRotate = 135;
            break;
          case "above-half":
            this.arrowRotate = 90 + 22;
            break;
          case "below":
            this.arrowRotate = 45;
            break;
          case "below-half":
            this.arrowRotate = 45 + 22;
            break;
          default:
            const _n: never = position.y;
            break;
        }
        break;

      case "left-half":
        switch (position.y) {
          case "middle":
            throw new Error("Cannot calculate arrow angle");
          case "above":
            this.arrowRotate = 135 + 22;
            break;
          case "above-half":
            throw new Error("Cannot calculate arrow angle");
          case "below":
            this.arrowRotate = 22;
            break;
          case "below-half":
            throw new Error("Cannot calculate arrow angle");
          default:
            const _n: never = position.y;
            break;
        }
        break;

      case "right":
        switch (position.y) {
          case "middle":
            this.arrowRotate = 270;
            break;
          case "above":
            this.arrowRotate = 225;
            break;
          case "above-half":
            this.arrowRotate = 225 + 22;
            break;
          case "below":
            this.arrowRotate = 315;
            break;
          case "below-half":
            this.arrowRotate = 315 - 22;
            break;
          default:
            const _n: never = position.y;
            break;
        }
        break;

      case "right-half":
        switch (position.y) {
          case "middle":
            throw new Error("Cannot calculate arrow angle");
          case "above":
            this.arrowRotate = 180 + 22;
            break;
          case "above-half":
            throw new Error("Cannot calculate arrow angle");
          case "below":
            this.arrowRotate = 360 - 22;
            break;
          case "below-half":
            throw new Error("Cannot calculate arrow angle");
          default:
            const _n: never = position.y;
            break;
        }
        break;
      default:
        const _n: never = position.x;
        break;
    }
  }

  private setItemPosition(position: Position, itemRect: Rect): void {
    switch (position.x) {
      case "middle":
        itemRect.left = this.blockRect.left + this.blockRect.width / 2 - itemRect.width / 2;
        this.arrowRect.left = this.blockRect.left + this.blockRect.width / 2 - this.arrowRect.width / 2;
        break;

      case "left":
        itemRect.left = this.blockRect.left - itemRect.width - this.arrowRect.width;
        this.arrowRect.left = this.blockRect.left - this.arrowRect.width;
        break;

      case "left-half":
        itemRect.left = this.blockRect.left - itemRect.width / 2;
        this.arrowRect.left = itemRect.left + itemRect.width / 2 - this.arrowRect.width / 4;
        break;

      case "right":
        itemRect.left = this.blockRect.left + this.blockRect.width + this.arrowRect.width;
        this.arrowRect.left = this.blockRect.left + this.blockRect.width;
        break;

      case "right-half":
        itemRect.left = this.blockRect.left + this.blockRect.width - itemRect.width / 2;
        this.arrowRect.left = itemRect.left + itemRect.width / 2 - this.arrowRect.width * 3 / 4;
        break;
      default:
        const _n: never = position.x;
        break;
    }

    switch (position.y) {
      case "middle":
        itemRect.top = this.blockRect.top + this.blockRect.height / 2 - itemRect.height / 2;
        this.arrowRect.top = this.blockRect.top + this.blockRect.height / 2 - this.arrowRect.height / 2;
        break;
      case "above":
        itemRect.top = this.blockRect.top - itemRect.height - this.arrowRect.height;
        this.arrowRect.top = this.blockRect.top - this.arrowRect.height;
        break;
      case "above-half":
        itemRect.top = this.blockRect.top - itemRect.height / 2;
        this.arrowRect.top = itemRect.top + itemRect.height / 2 - this.arrowRect.height / 4;
        break;
      case "below":
        itemRect.top = this.blockRect.top + this.blockRect.height + this.arrowRect.height;
        this.arrowRect.top = this.blockRect.top + this.blockRect.height;
        break;
      case "below-half":
        itemRect.top = this.blockRect.top + this.blockRect.height - itemRect.height / 2;
        this.arrowRect.top = itemRect.top + itemRect.height / 2 - this.arrowRect.height * 3 / 4;
        break;
      default:
        const _n: never = position.y;
        break;
    }
    //
    this.getCurrentItem().top = itemRect.top;
    this.getCurrentItem().left = itemRect.left;
  }

  private getMainRect(): Rect {
    const tourElement = document.getElementById("tour")!;
    const tourDocRect: DOMRect = tourElement.getBoundingClientRect();
    return new Rect().set(0, 0, tourDocRect.width, tourDocRect.height)
  }

  private getBlockRect(element: HTMLElement): Rect {
    const rect: DOMRect = element.getBoundingClientRect();
    const blockIndent = 5;
    return new Rect().set(Math.max(rect.top - blockIndent, 0), Math.max(rect.left - blockIndent, 0), Math.max(rect.width + blockIndent * 2, 0), Math.max(rect.height + blockIndent * 2, 0));
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

  private calculateItemPosition(itemRect: Rect, arrowRect: Rect, mainRect: Rect): Position {
    // Looking for position
    const positionsX = new Set<TPositionX>();
    const positionsY = new Set<TPositionY>();
    if (this.blockRect.top > itemRect.height + arrowRect.height) {
      positionsY.add("above");
    }
    if (this.blockRect.top > (itemRect.height + arrowRect.height) / 2) {
      positionsY.add("above-half");
    }
    if ((this.blockRect.top + this.blockRect.height / 2 > (itemRect.height / 2)) && (mainRect.height - this.blockRect.top - this.blockRect.height / 2 > (itemRect.height / 2))) {
      positionsY.add("middle");
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

    if ((this.blockRect.left + this.blockRect.width / 2 > (itemRect.width / 2)) && (mainRect.width - this.blockRect.left - this.blockRect.width / 2 > (itemRect.width / 2))) {
      positionsX.add("middle");
    }

    if (mainRect.width - this.blockRect.left - this.blockRect.width > itemRect.width + arrowRect.width) {
      positionsX.add("right");
    }
    if (mainRect.width - this.blockRect.left - this.blockRect.width > (itemRect.width + arrowRect.width) / 2) {
      positionsX.add("right-half");
    }

    const positions: Position[] = [];
    positionsX.forEach(posX => {
      if (posX === "left" || posX === "right") {
        positionsY.forEach(posY => positions.push(new Position(posX, posY)));
      }
    });

    positionsY.forEach(posY => {
      if (posY === "above" || posY === "below") {
        positionsX.forEach(posX => {
          const position = new Position(posX, posY);
          if (!positions.some(pos => pos.equals(position))) {
            positions.push(new Position(posX, posY));
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

  getTourItemStyle() {
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
    result['top'] = this.arrowRect.top + 'px';
    result['left'] = this.arrowRect.left + 'px';
    result['opacity'] = this.arrowOpacity;
    result['rotate'] = this.arrowRotate + 'deg';
    result['transition'] = 'opacity ' + this.TOUR_DELAY + 'ms ease-in-out';
    return result;
  }

}
