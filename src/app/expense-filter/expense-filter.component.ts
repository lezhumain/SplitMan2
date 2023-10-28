import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ExpenseModel} from "../models/expense-model";
import {BehaviorSubject} from "rxjs";
import {debounceTime, takeWhile} from "rxjs/operators";
import {IMongoID} from "../models/imongoid";

export interface IFilterData {filter: string, data: string[]}

@Component({
  selector: 'app-expense-filter',
  templateUrl: './expense-filter.component.html',
  styleUrls: ['./expense-filter.component.css']
})
export class ExpenseFilterComponent implements OnDestroy {
  private _filterValue$: BehaviorSubject<string> = new BehaviorSubject("");

  private _expenses: ExpenseModel[] = [];
  private alive: boolean;

  get expenses(): ExpenseModel[] {
    return this._expenses;
  }

  @Input()
  set expenses(value: ExpenseModel[]) {
    this._expenses = value;
  }

  private _filterValue: string = "";
  get filterValue(): string {
    return this._filterValue;
  }

  set filterValue(value: string) {
    this._filterValue = value;
    this._filterValue$.next(value);
  }

  @Output() filtered: EventEmitter<IFilterData> = new EventEmitter();

  constructor() {
    this.alive = true;
    this._filterValue$.pipe(
      debounceTime(100),
      takeWhile(() => this.alive)
    ).subscribe((val: string) => {
      this.doFilter(val);
    });
  }

  ngOnDestroy(): void {
    this.alive = false;
  }

  private doFilter(val: string) {
    let newExp: ExpenseModel[] = this._expenses.slice();
    if (val) {
      newExp = newExp.filter((g) => {
        return g.name.includes(val);
      });
    }
    else {
      newExp = [];
    }

    const mapped: string[] | undefined = newExp.map((r: ExpenseModel) => {
      if(!r._id) {
        return "";
      }

      const isMongoID = typeof (r._id) !== "string";
      return isMongoID ? (r._id as IMongoID).$oid : (r._id as string);
    });

    this.filtered.emit({filter: val, data: mapped});
  }
}
