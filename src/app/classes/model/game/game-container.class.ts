import { Color } from "../colors.class";

export class GameContainer {
  colors: Color[] = [];

  static equal(container1: GameContainer, container2: GameContainer): boolean {
    if (container1.colors.length !== container2.colors.length) {
      return false;
    }
    for (let i = 0; i < container1.colors.length; i++) {
      if (container1.colors[i] !== container2.colors[i]) {
        return false;
      }
    }
    return true;
  }

}
