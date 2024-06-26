import {Component, Input, OnInit} from '@angular/core';
import {ExpenseModel} from "../models/expense-model";
import {UserModel} from "../models/user-model";
import {Utils} from "../utilities/utils";
import {ParticipantModel} from "../models/participants";
import {IBalanceItem, SplitwiseHelper} from "../utilities/splitwiseHelper";

export interface IRepartitionItem {
  checked?: boolean;
  removed?: boolean;
  person: string;
  owesTo: string;
  amount: number;
}

@Component({
  selector: 'app-repartition',
  templateUrl: './repartition.component.html',
  styleUrls: ['./repartition.component.css']
})
export class RepartitionComponent implements OnInit {
  private _expenses: ExpenseModel[] = [];
  @Input()
  set expenses(val: ExpenseModel[]) {
    this._expenses = val;
    this.setup();
  }
  get expenses(): ExpenseModel[] {
    return this._expenses.slice();
  }

  allWhoSpent: string[] = [];

  @Input() connectedUser: UserModel | null = null;

  @Input() travelParticipants?: ParticipantModel[];

  allDeps: IRepartitionItem[] = [];
  allStr: string[] = [];
  balance: IBalanceItem[] = [];

  constructor() { }

  ngOnInit(): void {
    // const exp: ExpenseModel = this._expenses[0];
    // const payer = exp.payer;
    //
    // const res = {
    //   person: "",
    //   owesTo: payer,
    //   amount: 0
    // };
    //
    // this.allDeps = exp.payees.map((p: string, index: number, arr: string[]) => {
    //   const o = Object.assign({}, res);
    //   o.person = p;
    //   o.amount = exp.amount / arr.length;
    //    // this.allDeps = newArr1;
    //   return o;
    // });
    //
    // this.setup();
  }

  private setup() {
    // const newArr1 = this.handleRepartition();
    const newArr1: IRepartitionItem[] = this.handleRepartitionSplitWise();
    const balance: IBalanceItem[] = SplitwiseHelper.getBalance(newArr1);

    this.allDeps = newArr1;
    this.balance = balance;

    // const raprt1 = this.getInitialRepartition();
    // const data = raprt1.map((e: IRepartitionItem) => {
    //   const paidFor: {[person: string]: number} = {};
    //   paidFor[e.person] = e.amount;
    //
    //   return {
    //     paidBy: e.owesTo,
    //     paidFor: paidFor
    //   }
    // });
    // const res = new Splitwise(data);
    // this.allDeps = res.map(([from, to, value]: [string, string, number]) => {
    //   return {
    //     person: from,
    //     owesTo: to,
    //     amount: value
    //   }
    // });
    // debugger;

    this.allStr = this.allDeps.map(e => JSON.stringify(e));

    this.allWhoSpent = this.getWhoSpent();
  }

  private handleRepartition(current?: IRepartitionItem[]): IRepartitionItem[] {
    let gvbdf0: IRepartitionItem[] = current || [];

    if(gvbdf0.length === 0) {
      gvbdf0 = this.getInitialRepartition();
    }

    let gvbdf: IRepartitionItem[] = (gvbdf0 || []).reduce((res: any[], item: any, index: number, arr: any) => {
      // add up the values
      const target = res.find(r => r.person === item.person && r.owesTo === item.owesTo);
      if(target) {
        // target.amount += item.amount;
      }
      else {
        const listToAdd = arr.filter((r: any) => r.person === item.person && r.owesTo === item.owesTo);
        const sum = listToAdd.reduce((res: number, item: any) => {return res + item.amount;}, 0);
        const newi = Object.assign({}, item);
        newi.amount = sum;
        res.push(newi);
      }

      return res;
    }, []);

    const newArr: IRepartitionItem[] = gvbdf.slice();
    gvbdf.forEach((item: IRepartitionItem) => {
      // removes what we already owe

      if(!newArr.includes(item)) {
        return; // already handled
      }

      const targets = newArr.filter((g: any) => g.person === item.owesTo && g.owesTo === item.person);
      for(const target of targets) {
        if(item.amount < target.amount) {
          continue;
        }

        item.amount -= target.amount;
        const inh = newArr.indexOf(target);
        newArr.splice(inh, 1);

        if(Utils.checkAmounts(item.amount, 0, 2)) {
          const inh = newArr.indexOf(item);
          newArr.splice(inh, 1);
        }
      }
    });

    const newArr1: IRepartitionItem[] = newArr.slice();
    newArr.forEach((item: IRepartitionItem) => {
      // removes what we owe someone who already owes someone else

      if(!newArr1.includes(item) || item.removed) {
        return; // already handled
      }

      let otherOwes = newArr1.filter(na1 => na1.person !== item.person && na1.owesTo === item.owesTo);
      if(otherOwes.length > 0 && newArr1.length > 2) {
        otherOwes.forEach((oth: any) => {
          if(!newArr1.includes(item) || item.removed) {
            return; // already handled
          }

          const target = newArr1.find(nn => nn.person === oth.person && nn.owesTo === item.person);
          if (!target || target.removed) {
            return;
          }


          // if (item.amount > target.amount) {
          //   oth.amount += target.amount;
          //   item.amount -= target.amount;
          //
          //   // const inh = newArr1.indexOf(target);
          //   // newArr1.splice(inh, 1);
          //   // target.removed = true;
          // } else {
          //   oth.amount += item.amount;
          //   target.amount -= item.amount;
          //
          //   const inh = newArr1.indexOf(item);
          //   if (inh > -1) {
          //     newArr1.splice(inh, 1);
          //     item.removed = true;
          //     return;;
          //   }
          // }
          if (item.amount <= target.amount) {
            oth.amount += item.amount;
            target.amount -= item.amount;

            const inh = newArr1.indexOf(item);
            if (inh > -1) {
              newArr1.splice(inh, 1);
              item.removed = true;
              return;
            }
          }
        });
      }
    });

    const newArr2: IRepartitionItem[] = newArr1.slice();
    newArr1.forEach((item: IRepartitionItem) => {
      if(!newArr2.includes(item)) {
        return; // already handled
      }

      const targets = newArr2.filter(t => t.person === item.owesTo && t.owesTo !== item.person);
      for(let target of targets) {
        const toUpdateIndex = newArr2.findIndex(na2 => na2.owesTo === item.owesTo && na2.person === item.person);

        if(Utils.checkAmounts(item.amount, target.amount, 2)) {
          // const toUpdat = newArr2.find(na2 => na2.owesTo === item.owesTo && na2.person === item.person);
          if (toUpdateIndex > -1) {
            item.owesTo = target.owesTo;
            newArr2.splice(toUpdateIndex, 1, item);
          }

          const toRemoveIndex = newArr2.findIndex(na2 => na2.owesTo === target.owesTo && na2.person === target.person);
          if(toRemoveIndex > -1) {
            newArr2.splice(toRemoveIndex, 1);
          }
        }
        else if(item.amount < target.amount) {
          // const toUpdat = newArr2.find(na2 => na2.owesTo === item.owesTo && na2.person === item.person);
          // item.owesTo = target.owesTo;

          const toUpdateIndex = newArr2.findIndex(na2 => na2.owesTo === item.owesTo && na2.person === item.person);
          if (toUpdateIndex > -1) {
            item.owesTo = target.owesTo;
            newArr2.splice(toUpdateIndex, 1, item);
          }

          const toRemoveIndex = newArr2.findIndex(na2 => na2.owesTo === target.owesTo && na2.person === target.person);
          if(toRemoveIndex > -1) {
            target.amount -= item.amount;
            newArr2.splice(toRemoveIndex, 1, target);
          }
        }
      }
    });

    const res = newArr2; //newArr2;
    return res.length <= 1 || JSON.stringify(res) === JSON.stringify(current)
      ? res
      : this.handleRepartition(res);
  }

  private handleRepartitionSplitWise(current?: IRepartitionItem[]): IRepartitionItem[] {
    const rep: IRepartitionItem[] = SplitwiseHelper.split(this._expenses.filter(e => !e.isRemboursement));

    // TODO substract remboursements
    // const rembs: ExpenseModel[] = this._expenses.filter(e => e.isRemboursement);
    // for(const remb of rembs) {
    //   const targetRep = rep.find((r: IRepartitionItem) => {
    //     return r.owesTo === remb.payer && remb.payees.some(rp => rp.name === r.person)
    //   });
    // }

    return rep;
  }

  private getWhoSpent() {
    if(!this.expenses) {
      return [];
    }

    return this.expenses.reduce((res: string[], item: ExpenseModel) => {
      // if(item.payees.)
      const thePayees = item.payees.filter(p => !!p.e4xpenseRatio && !res.includes(p.name)).map(value => value.name);
      return res.concat(thePayees);
    }, []);
  }

  howMuchSpentStr(pers: string): string {
    return this.howMuchSpent(pers).toFixed(2);
  }

  howMuchSpent(pers: string): number {
    // TODO here
    // return this.expenses.filter(e => e.payees.some(ep => ep.name === pers)).reduce((res: number, item: ExpenseModel), 0)
    return this.expenses.filter(e => e.payees.some(ep => ep.name === pers && !!ep.e4xpenseRatio)).reduce((res: number, item: ExpenseModel) => {
      const target = item.payees.find(ip => ip.name === pers);
      if(target && target.e4xpenseRatio) {
        res += item.amount * target.e4xpenseRatio;
      }
      return res;
    }, 0);
  }

  spentPerDay(pers: string, spent: string): number {
    const targetPart = this.travelParticipants?.find(tp => tp.name === pers);
    if(!targetPart) {
      return 0;
    }
    return Number(spent) / targetPart.dayCount
  }

  private getInitialRepartition(): IRepartitionItem[] {
    return SplitwiseHelper.reduceExpenses(this._expenses);
  }

  private handleAC_AB_BC(all: IRepartitionItem[]) {
    return;
  }
}
