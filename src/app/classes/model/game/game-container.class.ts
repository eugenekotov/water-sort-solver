import { ColorUtils } from "../../controller/color-utils.class";
import { Color } from "../colors.class";
import { CONTAINER_SIZE } from "../const.class";

export class GameContainer {

  colors: Color[] = [];
  index: number;

  constructor(index: number) {
    this.index = index;
  }

  public static equal(container1: GameContainer, container2: GameContainer): boolean {
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

  public static compare(container1: GameContainer, container2: GameContainer): number {
    if (container1.colors.length !== container2.colors.length) {
      return container1.colors.length - container2.colors.length;
    } else {
      for (let i = container1.colors.length - 1; i >= 0; i--) {
        const c1 = container1.colors[i];
        const c1Index = Object.values(Color).findIndex(color => color === c1);
        const c2 = container1.colors[i];
        const c2Index = Object.values(Color).findIndex(color => color === c1);
        if (c1 !== c2) {
          return c1Index - c2Index;
        }
      }
      return 0;
    }
  }

  public static clone(container: GameContainer): GameContainer {
    const newContainer = new GameContainer(container.index);
    newContainer.colors = [...container.colors];
    return newContainer;
  }

  public static getColor(container: GameContainer, index: number): Color | undefined {
    return index < container.colors.length ? container.colors[index] : undefined;
  }

  public static containerToHex(container: GameContainer): string {
    let result = "";
    for (let i = CONTAINER_SIZE - 1; i >= 0; i--) {
      let color = GameContainer.getColor(container, i);
      result = result + ColorUtils.colorToHex(color);
    }
    return result;
  }

}
