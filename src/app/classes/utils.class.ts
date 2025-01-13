import { Position } from "../components/board-solve/board-solve.component";

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function calculateMovingDuration(from: Position, to: Position, speed: number): number {
  const way = Math.sqrt(Math.pow(to.top - from.top, 2) + Math.pow(to.left - from.left, 2));
  return (200 + way * 0.5) * 15 / speed;
}

