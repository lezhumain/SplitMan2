import {Component, Input, OnInit} from '@angular/core';
import {ExpenseModel} from "../models/expense-model";
import {Router} from "@angular/router";

@Component({
  selector: 'app-expense-card',
  templateUrl: './expense-card.component.html',
  styleUrls: ['./expense-card.component.css']
})
export class ExpenseCardComponent implements OnInit {
  private _expense: ExpenseModel = {} as ExpenseModel;
  @Input()
  set expense(val: ExpenseModel) {
    this._expense = val;
  }
  get expense(): ExpenseModel {
    return this._expense;
  }

  constructor(private readonly router: Router) { }

  ngOnInit(): void {
  }

  openExpense() {
    this.router.navigate(['travels', this.expense.tripId, "expense", this.expense.id]);
  }

}
