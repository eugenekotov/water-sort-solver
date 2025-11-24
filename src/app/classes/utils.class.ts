import { Color } from "./model/colors.class";
import { CONTAINER_SIZE } from "./model/const.class";
import { GameContainer } from "./model/game/game-container.class";
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

export class Utils {

  public static getContainerItemId(containerIndex: number, itemIndex: number): string {
    return `${Utils.getContainerId(containerIndex)}item${itemIndex}`;
  }

  public static getContainerId(index: number): string {
    return "container" + index;
  }

  public static getItemStyle(color: Color) {
    return { 'background-color': color };
  }

  public static createPositionContainer(containerIndex: number): GameContainer {
    const result = new GameContainer(containerIndex);
    result.colors = Array<Color>(CONTAINER_SIZE).fill(Color.RED);
    return result;
  }

  /**
   * @param date
   * @returns yyyy-mm-dd
   */
  public static dateToStr(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  public strToDate(stringDate: string): Date {
    return new Date(stringDate);
  }

}
