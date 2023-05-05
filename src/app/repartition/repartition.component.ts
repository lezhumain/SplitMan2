import {Component, Input, OnInit} from '@angular/core';
import {ExpenseModel} from "../models/expense-model";
import {ExpenseParticipantModel} from "../models/expenseParticipants";
import {UserModel} from "../models/user-model";
import {Utils} from "../utilities/utils";
import {Participant, ParticipantModel} from "../models/participants";

export interface IRepartitionItem {
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

    // this.allDeps = exp.payees.map((p: string, index: number, arr: string[]) => {
    //   const o = Object.assign({}, res);
    //   o.person = p;
    //   o.amount = exp.amount / arr.length;
    //
    //   return o;
    // });

    // this.setup();
  }

  private setup() {
    const newArr1 = this.handleRepartition();

    this.allDeps = newArr1;
    this.allStr = this.allDeps.map(e => JSON.stringify(e));

    this.allWhoSpent = this.getWhoSpent();
  }

  private handleRepartition(current?: IRepartitionItem[]): IRepartitionItem[] {
    let gvbdf0: IRepartitionItem[] = current || [];

    if(gvbdf0.length === 0) {
      gvbdf0 = this._expenses.map(exp => {
        const payer = exp.payer;

        // const res: IRepartitionItem = {
        //   person: "",
        //   owesTo: payer,
        //   amount: 0
        // };

        return exp.payees.map((p: ExpenseParticipantModel, index: number, arr: ExpenseParticipantModel[]) => {
          if (p.name !== payer && p.e4xpenseRatio) {
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
        }).filter((a: IRepartitionItem | null) => !!a);
      }).reduce((res: IRepartitionItem[], itemArr: any[], index: number, arr: any) => {
        return itemArr ? res.concat(itemArr) : res; // mergeMap
      }, []);
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

      if(!newArr1.includes(item)) {
        return; // already handled
      }

      let otherOwes = newArr1.filter(na1 => na1.person !== item.person && na1.owesTo === item.owesTo);
      if(otherOwes.length > 0 && newArr1.length > 2) {
        otherOwes.forEach((oth: any) => {
          const target = newArr1.find(nn => nn.person === oth.person && nn.owesTo === item.person);
          if (!target) {
            return;
          }


          if (item.amount > target.amount) {
            oth.amount += target.amount;
            item.amount -= target.amount;

            const inh = newArr1.indexOf(target);
            newArr1.splice(inh, 1);
          } else {
            oth.amount += item.amount;
            target.amount -= item.amount;

            const inh = newArr1.indexOf(item);
            newArr1.splice(inh, 1);
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

    const res = newArr2;
    return res.length <= 1 || JSON.stringify(res) === JSON.stringify(current)
      ? res
      : this.handleRepartition(res);
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
}
