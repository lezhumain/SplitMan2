import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {Expense} from "./models/expense";
import {map} from "rxjs/operators";
import {combineLatest} from "rxjs";
import {BaseService} from "./base-service.service";
import {ExpenseModel} from "./models/expense-model";
import {flatMap} from "rxjs/internal/operators";
import {UserServiceService} from "./user-service.service";
import {HttpClient} from "@angular/common/http";
import {ApiService} from "./api.service";

@Injectable({
  providedIn: 'root'
})
export class ExpenseService extends BaseService {
  private readonly storeKey = "expense";

  constructor(http: HttpClient, private readonly _apiService: ApiService) {
    super(http);
  }

  getExpenses(): Observable<Expense[]> {
    return this._apiService.getAllByType<Expense>(this.storeKey).pipe(
      map((o: Expense[]) => {
        return o.map((oo: Expense) => Expense.fromJson(oo));
      })
    );
  }

  getExpenseByIDandTrip(expenseID: number, travelID: number): Observable<Expense | null> {
    return this.getExpenses().pipe(
      map((all: Expense[]) => {
        return all.find(t => t.id === expenseID && t.tripId === travelID) || null;
      })
    );
  }

  private getNewId(): Observable<number> {
    return this.getExpenses().pipe(
      map((expenses: Expense[]) => {
        const lastID = Math.max(...expenses.map(t => t.id));
        return isFinite(lastID) ? lastID + 1 : 0;
      })
    );
  }

  saveExpenses(all: ExpenseModel[], userService: UserServiceService): Observable<null> {
    return combineLatest(
      all.map(expense => {
        const data = Expense.from(expense);
        const now = new Date();
        const userName = userService.getConnectedUsername();

        data.updatedAt = now;
        data.updatedBy = userName;

        if(data.id === -1) {
          data.createdAt = now;
          data.createdBy = userName;
          return this.getNewId().pipe(
            flatMap((newId: number) => {
              data.id = newId;
              return this._apiService.saveInDb(data);
            })
          );
        }

        return this._apiService.updateItem(data);
      })
    ).pipe(
      map(() => null)
    );
  }

  saveExpense(expense: ExpenseModel, userService: UserServiceService): Observable<null> {
    return this.saveExpenses([expense], userService);
  }

  getExpensesByTripID(travelID: number): Observable<Expense[]> {
    return this.getExpenses().pipe(
      map((all: Expense[]) => {
        return all.filter(t => t.tripId === travelID);
      })
    );
  }
}
