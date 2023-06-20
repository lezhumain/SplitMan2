import {ExpenseModel} from "../app/models/expense-model";
import {IRepartitionItem} from "../app/repartition/repartition.component";
import {allExpenses} from "../../e2e/data/allExpenses";

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

    if (oobj.totalFromRepartExpect !== null) {
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

  static theCheck(repartData: IRepartitionItem[], alExpenses: ExpenseModel[], me: string) {
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

    expect(myTravaelCostExpense).toEqual(myTravaelCostRep);
  }
}
