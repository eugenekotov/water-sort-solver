import { CONTAINER_SIZE } from "./model/const.class";
import { Position } from "./model/item.class";

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getItemIndex(containerIndex: number, itemIndex: number): number {
  return containerIndex * CONTAINER_SIZE + itemIndex;
}

export function getTopItemIndex(containerIndex: number): number {
  return containerIndex * CONTAINER_SIZE + CONTAINER_SIZE - 1;
}

export function getMovingPosition(itemElement: HTMLElement, parentRect: DOMRect): Position {
  const itemRect = itemElement.getBoundingClientRect();
  const top = itemRect.top - parentRect.top - 1;
  const left = itemRect.left - parentRect.left - 1;
  return new Position(left, top);
}

export function getMovingTopCoordinate(itemElement: HTMLElement, parentRect: DOMRect): number {
  const itemRect = itemElement!.getBoundingClientRect();
  const top = itemRect.top - parentRect.top - itemRect.height * 2;
  return top;
}

export class Utils {

  public static getContainerItemId(containerIndex: number, itemIndex: number): string {
    return `${Utils.getContainerId(containerIndex)}item${itemIndex}`;
  }

  public static getContainerId(index: number): string {
    return "container" + index;
  }

}
