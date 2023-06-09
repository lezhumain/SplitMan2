import {ExpenseModel} from "../app/models/expense-model";

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
}
