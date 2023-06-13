import {ExpenseModel} from "../models/expense-model";
import {ExpenseParticipantModel} from "../models/expenseParticipants";
import Splitwise1 from "splitwise-js-map";
import {IRepartitionItem} from "../repartition/repartition.component";
import {Utils} from "./utils";
import {checkBalance} from "../../../../node-splitwise-js/test_utils";
import {RepartitionUtils} from "../../test-data/test_utils";


export type SplitwiseInputPayees = {[payee: string]: number};

export interface SplitwiseInputItem {
  paidBy: string;
  paidFor: SplitwiseInputPayees;
}

// export class SplitwiseInputItemImpl implements SplitwiseInputItem {
//   paidBy: string;
//   paidFor: SplitwiseInputPayees;
//   constructor(obj: SplitwiseInputItem) {
//     this.paidBy = obj.paidBy;
//     this.paidFor = obj.paidFor;
//   }
//
//   toString() {
//     return JSON.stringify(this);
//   }
// }

export class SplitwiseHelper {
  private static expenseToInput(expenses: ExpenseModel[]): SplitwiseInputItem[] {
    return expenses.map((e: ExpenseModel, _index: number, all: ExpenseModel[]) => {
      return {
        paidBy: e.payer,
        paidFor: e.payees.reduce((res: SplitwiseInputPayees, item: ExpenseParticipantModel) => {
          res[item.name] = e.amount * (item.e4xpenseRatio || 0);
          return res;
        }, {})
      } as SplitwiseInputItem;
    });
  }

  static splitToRepartition(splits: [string, string, number][]): IRepartitionItem[] {
    return splits.map(([from, to, value]: [string, string, number]) => {
      return {
        person: from,
        owesTo: to,
        amount: value
      }
    });
  }

  private static splitOnly(input: SplitwiseInputItem[]): [string, string, number][] {
    return Splitwise1(input);
  }

  static split(expenses0: ExpenseModel[]): IRepartitionItem[] {
    // const init = expenses0.slice();
    // const gvbdf0 = SplitwiseHelper.reduceExpenses(init);
    // const expenses: ExpenseModel[] = SplitwiseHelper.repartitionToExpenses(gvbdf0);

    const expenses = expenses0.slice();

    const input = SplitwiseHelper.expenseToInput(expenses);
    console.log("inputs:");
    console.log(JSON.stringify(input, null, 2));
    const splits = this.splitOnly(input);

    let checked = false;
    try{
      checkBalance(splits, input);
      checked = true;
    }
    catch (e: any) {
      console.warn(`Error: ${e.message}`);
    }

    console.log("splits:");
    console.log(JSON.stringify(splits, null, 2));

    const res = SplitwiseHelper.splitToRepartition(splits);

    checked = false;
    try{
      RepartitionUtils.checkBalanceRepart(expenses, res);
      checked = true;
    }
    catch (e: any) {
      console.warn(`Error: ${e.message}`);
    }
    res.forEach(r => r.checked = checked);

    return res;
  }

  static splitFromRepart(gvbdf0: IRepartitionItem[]) {
    const all = gvbdf0.slice();

    const expenses: ExpenseModel[] = SplitwiseHelper.repartitionToExpenses(all);

    return SplitwiseHelper.split(expenses);
  }

  static reduceExpenses(expAll: ExpenseModel[]): IRepartitionItem[] {
    const mapped: IRepartitionItem[][] = expAll.map(exp => {
      const payer = exp.payer;

      // const res: IRepartitionItem = {
      //   person: "",
      //   owesTo: payer,
      //   amount: 0
      // };

      return exp.payees.map((p: ExpenseParticipantModel, index: number, arr: ExpenseParticipantModel[]) => {
        var grtshnr = p;
        if (p.name !== payer && p.e4xpenseRatio !== undefined && p.e4xpenseRatio > 0) {
          const o: IRepartitionItem = {} as IRepartitionItem;
          o.person = p.name;
          o.owesTo = payer;
          // o.amount = exp.amount / arr.length;
          o.amount = exp.amount * p.e4xpenseRatio;

          return o;
        }
        else {
          return null;
        }
      }).filter((a: IRepartitionItem | null) => !!a) as IRepartitionItem[];
    });

    // const reduced: IRepartitionItem[] = mapped.reduce((res: IRepartitionItem[], item: IRepartitionItem[]) => {
    //   return res.concat(...item);
    // }, []);

    const reduced = mapped.reduce((res: IRepartitionItem[], itemArr: any[], index: number, arr: any) => {
      const toAdd = [];

      for (const item of itemArr) {
        if(res.some(fr => fr.person === item.person && fr.owesTo === item.owesTo)
          || item.owesTo === item.person) {
          continue;
        }
        const existing: IRepartitionItem[] = [].concat(...arr).filter((rr: IRepartitionItem) => rr.owesTo === item.owesTo && rr.person === item.person);
        const sunFromEx = existing.reduce((res: number, item: IRepartitionItem) => {
          return res + item.amount;
        }, 0);

        // TODO chekc this
        // item.amount += sunFromEx;
        item.amount = sunFromEx;

        const tt = res.find(fr => fr.person === item.owesTo && fr.owesTo === item.person);
        if(tt) {
          if(tt.amount <= item.amount) {
            item.amount -= tt.amount;
            res.splice(res.indexOf(tt), 1);
            toAdd.push(item);
          }
        }
        else {
          toAdd.push(item);
        }
      }
      const all = res.concat(toAdd);
      // this.handleAC_AB_BC(all);
      return itemArr && itemArr.length > 0 ? all : res; // mergeMap
    }, []);

    return reduced;
  }

  static equalRepartition(rep0: IRepartitionItem[], epxwecrt: IRepartitionItem[]): boolean {
    return rep0.every(rep =>
      !! epxwecrt.find(ee => ee.person === rep.person && ee.owesTo === rep.owesTo && ee.amount === rep.amount)
    );
  }

  // static splitFromRepartExp(expenses: ExpenseModel[]): IRepartitionItem[] {
  //   const gvbdf0 = SplitwiseHelper.reduceExpenses(expenses);
  //   return SplitwiseHelper.splitFromRepart(gvbdf0);
  // }

  private static repartitionToExpenses(all: IRepartitionItem[]): ExpenseModel[] {
    let expenses: ExpenseModel[] = [];
    for (const item of all) {
      if(expenses.find(ee => ee.payer === item.owesTo)) {
        continue;
      }
      const g = all.slice();
      console.log(g);
      let totalAmount = 0;
      const myRes = {
        amount: 0,
        payer: item.owesTo,
        payees: g.reduce((rres: any[], ritem: IRepartitionItem) => {
          if (ritem.owesTo === item.owesTo) {
            totalAmount += ritem.amount;
            const model = ExpenseParticipantModel.from({
              name: ritem.person,
              e4xpenseRatio: ritem.amount
            });

            const rar = rres.find((rl: ExpenseParticipantModel) => rl.name === model.name);
            if(rar) {
              rar.e4xpenseRatio += ritem.amount;
            }
            else {
              rres.push(model);
            }
          }

          return rres;
        }, [])
      } as ExpenseModel;
      myRes.amount = totalAmount;
      myRes.payees.forEach((p: ExpenseParticipantModel) => {
        p.e4xpenseRatio = (p.e4xpenseRatio || 0) / totalAmount;
        // p.e4xpenseRatio = Utils.round(Utils.checkAmounts(p.e4xpenseRatio || 0, totalAmount, 2, "/"), 2);
        // p.e4xpenseRatio = Utils.round((Utils.round(p.e4xpenseRatio || 0, 2)) / Utils.round(totalAmount, 2), 2);
      });

      expenses.push(myRes);
    }

    return expenses;
  }
}
