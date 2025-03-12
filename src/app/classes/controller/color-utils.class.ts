import { Color } from "../model/colors.class";
import { TBinaryData, TBit } from "./game-controller.class";

export class ColorUtils {

  public static colorOrdinal(color: Color | undefined): number {
    if (color === undefined) {
      return Object.values(Color).length;
    }
    return Object.values(Color).findIndex(c => c === color);
  }

  public static colorToBinaryData(color: Color | undefined): TBinaryData {
    const result: TBit[] = new Array(4);
    const ordinal = ColorUtils.colorOrdinal(color);
    result[0] = this.getBit(ordinal, 3);
    result[1] = this.getBit(ordinal, 2);
    result[2] = this.getBit(ordinal, 1);
    result[3] = this.getBit(ordinal, 0);
    return result;
  }

  public static colorToHex(color: Color | undefined): string {
    const ordinal = ColorUtils.colorOrdinal(color);
    return ordinal.toString(16).toUpperCase();
  }

  private static getBit(value: number, nBit: number): TBit {
    const bitValue = Math.pow(2, nBit);
    return (value & bitValue) === 0 ? 0 : 1;
  }

}
