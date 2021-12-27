export class Utils {
  static isDate(d: any): boolean {
    return !!d.getTime && !isNaN(d.getTime())
  }

  static checkAmounts(amount: number, amount1: number, decimals: number, targetBit = "==="): boolean {
    amount = Math.round(amount * Math.pow(10, decimals));
    amount1 = Math.round(amount1 * Math.pow(10, decimals));

    const res = eval(`${amount} ${targetBit} ${amount1}`);

    return res
  }
}
