import { ColorUtils } from "../../controller/color-utils.class";
import { Color } from "../colors.class";
import { CONTAINER_SIZE } from "../const.class";

export class GameContainer {

  colors: Color[] = [];
  index: number;
  resolved: boolean = false;

  constructor(index: number) {
    this.index = index;
  }

  public peek(): Color {
    if (this.isEmpty()) {
      console.error("Container is empty.");
    }
    return this.colors[this.colors.length - 1];
  }

  public size(): number {
    return this.colors.length;
  }

  public pop(): Color {
    if (this.isEmpty()) {
      console.error("Container is empty.");
    }
    this.resolved = false;
    return this.colors.pop()!;
  }

  public push(color: Color): void {
    this.colors.push(color);
    this.checkResolved();
  }

  public isEmpty(): boolean {
    return this.size() === 0;
  }

  public isFull(): boolean {
    return this.size() === CONTAINER_SIZE;
  }

  public getTopColorCount(): number {
    if (this.isEmpty()) {
      return 0;
    }
    let result = 1;
    const color = this.peek();
    let i = this.size() - 2;
    while (i >= 0 && this.colors[i] === color) {
      result++;
      i--;
    }
    return result
  }

  public checkResolved(): boolean {
    return GameContainer.checkResolved(this);
  }

  public clear(): void {
    this.colors = [];
    this.resolved = false;
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
    newContainer.resolved = container.resolved;
    return newContainer;
  }

  public static cloneContainers(containers: GameContainer[]): GameContainer[] {
    return containers.map(container => GameContainer.clone(container));
  }

  public static checkResolvedContainers(containers: GameContainer[]): void {
    return containers.forEach(container => container.checkResolved());
  }


  public static isResolvedContainers(containers: GameContainer[]): boolean {
    return containers.every(container => container.colors.length === 0 || container.resolved);
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

  static checkResolved(container: GameContainer): boolean {
    container.resolved = GameContainer.isFull(container) && GameContainer.hasOnlyOneColor(container);
    return container.resolved;
  }

  static size(container: GameContainer): number {
    return container.colors.length;
  }

  static isEmpty(container: GameContainer): boolean {
    return GameContainer.size(container) === 0;
  }

  static isFull(container: GameContainer): boolean {
    return GameContainer.size(container) === CONTAINER_SIZE;
  }

  static peek(container: GameContainer): Color {
    return container.colors[container.colors.length - 1];
  }

  static push(container: GameContainer, color: Color): void {
    container.colors.push(color);
    GameContainer.checkResolved(container);
  }

  static pop(container: GameContainer): Color {
    container.resolved = false;
    const color = container.colors.pop();
    if (!color) {
      throw new Error("Cannot pop color from empty container");
    }
    return color;
  }

  static hasOnlyThreeOfOneColor(container: GameContainer): boolean {
    return GameContainer.size(container) === 3
      && container.colors[0] === container.colors[1]
      && container.colors[0] === container.colors[2];
  }

  static hasOnlyTwoOfOneColor(container: GameContainer): boolean {
    return GameContainer.size(container) === 2 && container.colors[0] === container.colors[1];
  }

  static hasOnlyOneOfOneColor(container: GameContainer): boolean {
    return GameContainer.size(container) === 1;
  }

  static hasOnlyOneColor(container: GameContainer): boolean {
    if (GameContainer.isEmpty(container)) {
      return false;
    }
    return container.colors.every(color => color === container.colors[0]);
  }

  public static getElementId(containerIndex: number, itemIndex: number): string {
    return "container" + containerIndex + "item" + itemIndex;
  }

}
