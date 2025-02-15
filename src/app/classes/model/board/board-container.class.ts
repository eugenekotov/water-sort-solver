import { Color } from "../colors.class";
import { CONTAINER_SIZE } from "../const.class";
import { GameContainer } from "../game/game-container.class";

export class BoardContainer {

  gameContainer: GameContainer;
  resolved: boolean = false;
  index: number;

  static checkRsolved(container: BoardContainer) {
    container.resolved = BoardContainer.isFull(container) && BoardContainer.hasOnlyOneColor(container);
  }

  static size(container: BoardContainer): number {
    return container.gameContainer.colors.length;
  }

  static isEmpty(container: BoardContainer): boolean {
    return BoardContainer.size(container) === 0;
  }

  static isFull(container: BoardContainer): boolean {
    return BoardContainer.size(container) === CONTAINER_SIZE;
  }

  static peek(container: BoardContainer): Color {
    return container.gameContainer.colors[container.gameContainer.colors.length - 1];
  }

  static push(container: BoardContainer, color: Color): void {
    container.gameContainer.colors.push(color);
    BoardContainer.checkRsolved(container);
  }

  static pop(container: BoardContainer): Color {
    container.resolved = false;
    const color = container.gameContainer.colors.pop();
    if (!color) {
      throw new Error("Cannot pop color from empty container");
    }
    return color;
  }

  static hasOnlyThreeOfOneColor(container: BoardContainer): boolean {
    return BoardContainer.size(container) === 3
      && container.gameContainer.colors[0] === container.gameContainer.colors[1]
      && container.gameContainer.colors[0] === container.gameContainer.colors[2];
  }

  static hasOnlyTwoOfOneColor(container: BoardContainer): boolean {
    return BoardContainer.size(container) === 2 && container.gameContainer.colors[0] === container.gameContainer.colors[1];
  }

  static hasOnlyOneOfOneColor(container: BoardContainer): boolean {
    return BoardContainer.size(container) === 1;
  }

  static hasOnlyOneColor(container: BoardContainer): boolean {
    if (BoardContainer.isEmpty(container)) {
      return false;
    }
    return container.gameContainer.colors.every(color => color === container.gameContainer.colors[0]);
  }


}
