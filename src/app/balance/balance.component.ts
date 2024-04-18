import {Component, Input} from '@angular/core';
import {UserModel} from "../models/user-model";
import {IBalanceItem} from "../utilities/splitwiseHelper";

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css']
})
export class BalanceComponent {
  private _balance: IBalanceItem[] = [];
  @Input() set balance(val: IBalanceItem[]) {
    this._balance = val;
    this._cache = {};
    this.max = this.getMax();
  }

  get balance(): IBalanceItem[] {
    return this._balance;
  }


  private _cache: { [person: string]: number } = {};
  max: number = 0;

  displayNumber(val: number): string {
    return (Math.round(val * 10) / 10).toString();
  }

  private getMax() {
    return Math.max(...this.balance.map(b => Math.abs(b.amount)));
  }

  // getPercFor(pers: IBalanceItem, shouldBePositive: boolean) {
  //   if((!shouldBePositive && pers.amount > 0) || (shouldBePositive && pers.amount < 0)) {
  //     return 0;
  //   }
  //
  //   let cache = this._cache[pers.name];
  //   if(!cache) {
  //     // const tot = this.balance.reduce((res: number, item: IBalanceItem) => {
  //     //
  //     //   return res;
  //     // }, 0);
  //     const max = this.getMax();
  //     const perc = pers.amount * 100 / max;
  //
  //     this._cache[pers.name] = perc;
  //     cache = perc;
  //   }
  //
  //   return cache;
  // }
}
