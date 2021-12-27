import { Component, OnInit } from '@angular/core';
import {TravelModel} from "../models/travel-model";
import {ExpenseModel} from "../models/expense-model";
import {ExpenseService} from "../expense.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Expense} from "../models/expense";
import {NavBarService} from "../nav-bar.service";

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.css']
})
export class ExpenseComponent implements OnInit {
  expense: ExpenseModel = new ExpenseModel();

  constructor(private readonly expenseService: ExpenseService,
              private readonly route: ActivatedRoute,
              private readonly router: Router,
              private readonly _navService: NavBarService) { }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    const paramID: string | null = routeParams.get('travelID');
    const travelID: number | null = paramID === null ? null : Number(paramID);
    const paramIDex: string | null = routeParams.get('expenseID');
    const expenseID: number | null = paramID === null ? null : Number(paramIDex);

    if(travelID === null || expenseID === null) {
      // TODO display error
      return;
    }

    this.expenseService.getExpenseByIDandTrip(expenseID, travelID).subscribe((t: Expense | null) => {
      if (t) {
        this.expense = ExpenseModel.fromExpense(t);
      }
    });

    this._navService.setBackValue(`/travels/${travelID}`);
  }

  editExpense() {
    this.router.navigate(['travels', this.expense.tripId, "expense", this.expense.id, "edit"]);
  }

  getTypeof(date: any) {
    return typeof(date);
  }
}
