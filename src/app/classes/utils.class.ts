import { Position } from "../components/board-solve/board-solve.component";
import { CONTAINER_SIZE } from "./model/const.class";

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function calculateMovingDuration(from: Position, to: Position, speed: number): number {
  const way = Math.sqrt(Math.pow(to.top - from.top, 2) + Math.pow(to.left - from.left, 2));
  return (200 + way * 0.5) * 15 / speed;
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
  return new Position(top, left);
}

export function getMovingTopCoordinate(itemElement: HTMLElement, parentRect: DOMRect): number {
  const itemRect = itemElement!.getBoundingClientRect();
  const top = itemRect.top - parentRect.top - itemRect.height * 2;
  return top;
}

