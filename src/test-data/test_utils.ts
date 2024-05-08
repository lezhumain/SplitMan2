import {ExpenseModel} from "../app/models/expense-model";
import {IRepartitionItem} from "../app/repartition/repartition.component";
import {allExpenses} from "../../e2e/data/allExpenses";
import {Utils} from "../app/utilities/utils";
import {ExpenseParticipantModel} from "../app/models/expenseParticipants";

function getTotalFromRepart(me: string, rep: IRepartitionItem[]) {
  const gdrhr = rep.reduce((r, i) => {
    if(i.owesTo === me || i.person === me) {
      r += i.amount;
    }
    return r;
  }, 0);

  return gdrhr;
}

function getTotalOwedFromRepart(me: string, rep: IRepartitionItem[]) {
  const gdrhr = rep.reduce((r, i) => {
    if(i.owesTo === me) {
      r += i.amount;
    }
    else if(i.person === me) {
      r -= i.amount;
    }
    return r;
  }, 0);

  return gdrhr;
}


export function sanityCheck(allDeps: IRepartitionItem[], expenses: ExpenseModel[], expected: IRepartitionItem[]) {
  const allUsers: string[] = allDeps.reduce((res: string[], item: IRepartitionItem) => {
    if(!res.includes(item.person)) {
      res.push(item.person);
    }

    if(!res.includes(item.owesTo)) {
      res.push(item.owesTo);
    }

    return res;
  }, []);

  const all = [];
  for(const user of allUsers) {
    // RepartitionUtils.theCheck(allDeps, expenses, user);
    const u = user;
    const datad = RepartitionUtils.getOwedAll(expenses, user);

    const oobj = {
      user: u,
      totalSpent: datad.iPaidForMe + datad.iPaidForOthers,
      totalSpentForSelf: datad.iPaidForMe,
      totalSpentForOthers: datad.iPaidForOthers,
      totalOwed: datad.owed,
      totalPaidByOthersForSelf: datad.othersPaidForMe,
      totalFromRepart: getTotalFromRepart(u, allDeps),
      totalFromRepartExpect: expected.length > 0 ? getTotalFromRepart(u, expected) : null,
      totalOwedFromRepart: getTotalOwedFromRepart(u, allDeps)
    };
    all.push(oobj);
  }

  for(const oobj of all) {
    console.log(20);
    console.log(JSON.stringify(oobj, null, 2));

    if(oobj.totalOwed > 0 && Math.abs(oobj.totalOwed) != oobj.totalSpentForOthers - oobj.totalPaidByOthersForSelf) {
      throw new Error(`Error total 0: ${oobj.totalOwed} - ${oobj.totalFromRepart}`);
    }

    // if(oobj.totalOwed > 0 && Math.abs(oobj.totalOwed) != oobj.totalFromRepart) {
    //   throw new Error(`Error total: ${oobj.totalOwed} - ${oobj.totalFromRepart}`);
    // }

    if (oobj.totalFromRepartExpect !== null && oobj.totalFromRepartExpect > 0) {
      console.log(21);
      if(Math.abs(oobj.totalFromRepartExpect) != Math.round(oobj.totalFromRepart)) {
        throw new Error(`Error total 1: ${Math.abs(oobj.totalFromRepartExpect)} - ${Math.round(oobj.totalFromRepart)}`);
      }
      console.log(22);
    }

    // This is fine
    if(Math.round(oobj.totalSpent) != Math.round(oobj.totalOwed + oobj.totalPaidByOthersForSelf + oobj.totalSpentForSelf)) {
      throw new Error(`Error total 3: ${Math.round(oobj.totalSpent)} - ${Math.round(oobj.totalOwed + oobj.totalPaidByOthersForSelf + oobj.totalSpentForSelf)}`);
    }
    console.log(23);
    if(oobj.totalOwed !== oobj.totalOwedFromRepart) {
      throw new Error("total owed don't match: " + `${oobj.totalOwed} !== ${oobj.totalOwedFromRepart}`);
    }
  }
}
export function checkArray(allDeps: any[], expected: any[], doThrow = true): boolean {
  allDeps.forEach(d => {
    d.amount = Math.round(d.amount * 100) / 100;
  });

  let hasError = false;
  if(allDeps.length != expected.length) {
    hasError = true;
  }

  if (!hasError) {
    for (let dep of allDeps) {
      if (!expected.some(e => dep.person === e.person && dep.owesTo === e.owesTo && Math.round(dep.amount) === Math.round(e.amount))) {
        hasError = true;
        break;
      }
    }
  }

  if(doThrow && hasError) {
    throw new Error("Array don't match :(");
  }

  return hasError;
}

interface ICheckBalanceResult {
  user: string
  owedInRepart: number
  sortiePoche: number
  totalCost: number
  costListSum: number
  eq: boolean
  errMsg: string
}

class CheckBalanceResult implements ICheckBalanceResult {
  private readonly _owed: number;
  private readonly _totalCostCalc: number;
  private readonly _totalCostOK: boolean;
  private readonly _owedOk: boolean;

    get owed(): number {
      return this._owed;
    }

    get totalCostCalc(): number {
      return this._totalCostCalc;
    }

    get totalCostOK(): boolean {
      return this._totalCostOK;
    }

    get owedOk(): boolean {
      return this._owedOk;
    }

    user: string = "";
    owedInRepart: number = 0;
    sortiePoche: number = 0;
    totalCost: number = 0;
    costListSum: number = 0;
    eq: boolean = false;
    errMsg: string = "";

    constructor(obj: ICheckBalanceResult) {
      Object.assign(this, obj);

      this._owed = RepartitionUtils.sortOutNumber(this.sortiePoche - this.totalCost);
      this._totalCostCalc = RepartitionUtils.sortOutNumber(this.sortiePoche - this.owedInRepart);
      // this.totalCostOK = RepartitionUtils.sortOutNumber(this.totalCostO - this.totalCostCalc);
      this._totalCostOK = RepartitionUtils.checkResults([this.totalCost, this._totalCostCalc], "", false).eq;
      this._owedOk = RepartitionUtils.checkResults([this.owedInRepart - this._owed, this.totalCost - this._totalCostCalc], "", false).eq;
    }
}

export class RepartitionUtils {
  static getIPaidForOthers(allExp: ExpenseModel[], me: string): [number, number] {
    const targs = allExp.filter(ae => ae.payer === me);
    return targs.reduce((res, item) => {
      let forMe = 0;
      const otherPayees = item.payees;
      res[0] = res[0] + otherPayees.reduce((rres, ritem) => {
        const toAdd = item.amount * (ritem?.e4xpenseRatio || 0);
        if(ritem.name !== me) {
          rres += toAdd;
        }
        else {
          forMe += toAdd;
        }
        return rres
      }, 0);

      res[1] = res[1] + forMe;

      return res;
    }, [0, 0]);
  }

  static getOthersPaidForMe(allExp: ExpenseModel[], me: string): number {
    const targs = allExp.filter(ae => ae.payer !== me && ae.payees.find(aep => aep.name === me));
    return targs.reduce((res, item) => {
      const mePayee = item.payees.find(i => i.name === me);
      return res + item.amount * (mePayee?.e4xpenseRatio || 0);
    }, 0);
  }

  static getPaidTotalRaw(allExp: ExpenseModel[], me: string): number {
    return allExp.reduce((res, item) => {
      if(item.payer === me) {
        res += item.amount;
      }
      return res;
    }, 0);
  }

  static getOwedAll(allExp: ExpenseModel[], me: string): any {
    //const me = "dju";
    const iPaidForOthers = RepartitionUtils.getIPaidForOthers(allExp, me);
    const othersPaidForMe = RepartitionUtils.getOthersPaidForMe(allExp, me);
    return {
      iPaidForOthers: iPaidForOthers[0],
      iPaidForMe: iPaidForOthers[1],
      othersPaidForMe,
      owed: iPaidForOthers[0] - othersPaidForMe
    }
  }

  static getOwed(allExp: ExpenseModel[], me: string): number {
    //const me = "dju";
    const res = RepartitionUtils.getOwedAll(allExp, me);
    return res.owed;
  }

  static theCheck(repartData: IRepartitionItem[], alExpenses: ExpenseModel[], me: string): boolean {
    const res = RepartitionUtils.getIPaidForOthers(alExpenses, me);
    const whatIPaidForMe = res[1];
    const whatOthersPaidForMe = RepartitionUtils.getOthersPaidForMe(alExpenses, me);

    const myTravaelCostExpense = whatIPaidForMe + whatOthersPaidForMe;

    const whatIPaidTotal = RepartitionUtils.getPaidTotalRaw(alExpenses, me);
    const whatImOwed = repartData.reduce((res, item) => {
      if(item.owesTo === me) {
        res += item.amount;
      }
      return res;
    }, 0);
    const myTravaelCostRep = whatIPaidTotal - whatImOwed;

    return myTravaelCostExpense === myTravaelCostRep;
  }

  /**
   * Adjusts a number to the specified digit.
   *
   * @param {"round" | "floor" | "ceil"} type The type of adjustment.
   * @param {number} value The number.
   * @param {number} exp The exponent (the 10 logarithm of the adjustment base).
   * @returns {number} The adjusted value.
   */
  static decimalAdjust(type: "round" | "floor" | "ceil", value: number, exp: number) {
    // type = String(type);
    if (!["round", "floor", "ceil"].includes(type)) {
      throw new TypeError(
        "The type of decimal adjustment must be one of 'round', 'floor', or 'ceil'.",
      );
    }
    exp = Number(exp);
    value = Number(value);
    if (exp % 1 !== 0 || Number.isNaN(value)) {
      return NaN;
    } else if (exp === 0) {
      return Math[type](value);
    }
    const [magnitude, exponent = 0] = value.toString().split("e");
    const adjustedValue = Math[type](Number(`${magnitude}e${Number(exponent) - exp}`));
    // Shift back
    const [newMagnitude, newExponent = 0] = adjustedValue.toString().split("e");
    return Number(`${newMagnitude}e${+newExponent + exp}`);
  }

  static checkBalanceRepart(expenses: any, allDeps: IRepartitionItem[], doThrow = true): CheckBalanceResult[] {
    // TODO type for expenses
    const getSumOwedFor = (getFor: string, wereOwed = true): number => {
      // return allDeps.filter((p: IRepartitionItem) => wereOwed ? p.owesTo === getFor : p.person === getFor).reduce((res: number, item: IRepartitionItem) => {
      //   return res + item.amount
      // }, 0);

      // we're owed
      const allOwed: number = allDeps.filter((p: IRepartitionItem) => p.owesTo === getFor).reduce((res: number, item: IRepartitionItem) => {
        return res + item.amount
      }, 0);

      // we owe
      const allWeOwe: number = allDeps.filter((p: IRepartitionItem) => p.person === getFor).reduce((res: number, item: IRepartitionItem) => {
        return res + item.amount
      }, 0);

      return allOwed - allWeOwe;
    };

    const users: string[] = expenses.reduce((res: string[], item: ExpenseModel) => {
      const toAdd: string[] = item.payees.map(p => p.name).concat([item.payer]);
      const filtered: string[] = toAdd.filter((taf: string) => !res.includes(taf));
      return res.concat(filtered);
    }, []);
    users.sort();

    const expToCheck = expenses.map((e: ExpenseModel) => {
      const ii: any = Object.assign({}, e);
      delete ii.createdAt;
      delete ii.createdBy;
      delete ii.updatedAt;
      delete ii.updatedBy;
      delete ii.tripId;
      delete ii.id;
      delete ii.name;
      delete ii.date;

      return ii;
    });

    const allObj: CheckBalanceResult[] = [];
    for(const user of users) {
      const sortiePoche = expenses.filter((ex: ExpenseModel) => ex.payer === user)
        .reduce((res: number, item: ExpenseModel) => res + item.amount, 0);

      const totalCost: number = expenses.reduce((res: number, ex: ExpenseModel) => {
        const targ = ex.payees.find(exp => exp.name === user);
        if(targ) {
          res += ex.amount * (targ.e4xpenseRatio || 0);
        }

        return res;
      }, 0);

      const costList = [].concat(
        ...expenses.filter((o: ExpenseModel) => o.payees.some(exp => exp.name === user))
            .map((o: ExpenseModel) => {
              return {...o.payees.find((o: ExpenseParticipantModel) => o.name === user), a: o.amount};
            })
      );
      const costListSum = costList.reduce((res: number, it: any) => res + it.a * it.e4xpenseRatio, 0);

      const wereOwed = sortiePoche > totalCost;
      const owedInRepart = getSumOwedFor(user, wereOwed);
      // const owedInRepartCorrect = wereOwed ? owedInRepart : (owedInRepart * -1);
      const owedInRepartCorrect = owedInRepart;

      const eqData: [number, number] = [Math.abs(owedInRepart), Math.abs(sortiePoche - totalCost)];
      const {eq, errMsg} = RepartitionUtils.checkResults(eqData, user, doThrow);

      const oobj: ICheckBalanceResult = {
        user,

        // sortiePoche: sortiePoche,
        // totalCost: totalCost,
        // costListSum: costListSum,

        // owedInRepart: Number(owedInRepartCorrect.toPrecision(4)),
        // sortiePoche: Number(sortiePoche.toPrecision(4)),
        // totalCost: Number(totalCost.toPrecision(4)),
        // costListSum: Number(costListSum.toPrecision(4)),

        owedInRepart: RepartitionUtils.sortOutNumber(owedInRepartCorrect),
        sortiePoche: RepartitionUtils.sortOutNumber(sortiePoche),
        totalCost: RepartitionUtils.sortOutNumber(totalCost),
        costListSum: RepartitionUtils.sortOutNumber(costListSum),

        eq,
        errMsg
      };


      // oobj.owed = Number((oobj.sortiePoche - oobj.totalCost).toFixed(1));
      // // oobj.totalCostCalc = oobj.sortiePoche + oobj.owedInRepart;
      // oobj.totalCostCalc = Number((oobj.sortiePoche - oobj.owedInRepart).toFixed(1));
      //
      // // oobj.totalCostOK = oobj.totalCost.toFixed(1) === oobj.totalCostCalc.toFixed(1);
      // oobj.totalCostOK = Math.trunc(oobj.totalCost) === Math.trunc(oobj.totalCostCalc);

      // oobj.owed = Number((oobj.sortiePoche - oobj.totalCost).toPrecision(4));
      // // oobj.totalCostCalc = Number((oobj.sortiePoche - oobj.owedInRepart).toPrecision(4));
      // oobj.totalCostCalc = Number(oobj.sortiePoche.toPrecision(4)) - oobj.owedInRepart;
      // // oobj.totalCostOK = oobj.totalCost.toPrecision(3) === oobj.totalCostCalc.toPrecision(3);
      // oobj.totalCostOK = RepartitionUtils.decimalAdjust("floor", oobj.totalCost, 0) === RepartitionUtils.decimalAdjust("floor", oobj.totalCostCalc, 0);

      // oobj.owed = RepartitionUtils.sortOutNumber(oobj.sortiePoche - oobj.totalCost);
      // oobj.totalCostCalc = RepartitionUtils.sortOutNumber(oobj.sortiePoche - oobj.owedInRepart);
      // // oobj.totalCostOK = RepartitionUtils.sortOutNumber(oobj.totalCostO - oobj.totalCostCalc);
      // oobj.totalCostOK = RepartitionUtils.checkResults([oobj.totalCost, oobj.totalCostCalc], "", false).eq;
      // oobj.owedOk = RepartitionUtils.checkResults([oobj.owedInRepart - oobj.owed, oobj.totalCost - oobj.totalCostCalc], "", false).eq;
      const myO = new CheckBalanceResult(oobj);

      allObj.push(myO);
    }

    return allObj;
  }

  static sortOutNumber(number: number): number {
    return Math.round((number) * 100) / 100
  }

  static checkResults(eqData: [number, number], user: string, doThrow: boolean, allowedOffset = 0.5) {
    // const eqData = [owedInRepart, sortiePoche - totalCost];

    // const eq = Utils.checkAmounts(eqData[0], eqData[1], 1);
    // const eq = RepartitionUtils.decimalAdjust("floor", eqData[0], 0) === RepartitionUtils.decimalAdjust("floor", eqData[1], 0);
    // const eq = Number(eqData[0].toPrecision(4)) === Number(eqData[1].toPrecision(4));
    const first = RepartitionUtils.sortOutNumber(eqData[0]);
    const second = RepartitionUtils.sortOutNumber(eqData[1]);
    let eq = first === second;

    console.log(`${user} ${eq} %o`, eqData);

    let errMsg = "";
    if(!eq) {
      if(Math.abs(first - second) > allowedOffset) {
        if (doThrow) {
          throw new Error(`Wrong amount check: ${first} !== ${second}`); // TODO don't throw (if used in app)
        }
        errMsg = `Wrong amount check: ${first} !== ${second}`;
      }
      else {
        eq = true;
      }
    }

    return {
      eq,
      errMsg
    }
  }
}
