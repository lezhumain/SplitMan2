export class Utils {
  static isDate(d: any): boolean {
    return !!d.getTime && !isNaN(d.getTime())
  }

  static round(amount: number, decimals: number): number {
    const val = Math.pow(10, decimals)
    return Math.round(amount * val) / val;
  }

  static checkAmounts<T>(amount: number, amount1: number, decimals: number, targetBit = "==="): T {
    amount = Utils.round(amount, decimals);
    amount1 = Utils.round(amount1, decimals);

    const res: T = eval(`${amount} ${targetBit} ${amount1}`);

    return res;
  }
}
