import {Component, Input, OnInit} from '@angular/core';
import {ExpenseModel} from "../models/expense-model";
import {Router} from "@angular/router";
import {CategorieService} from "../categorie.service";
import {UserServiceService} from "../user-service.service";
import {InviteDate} from "../models/user-model";

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
    this.isOurExpense = this.getIsOurExpense();
  }
  get expense(): ExpenseModel {
    return this._expense;
  }

  isOurExpense: boolean = false;

  constructor(private readonly router: Router,
              private readonly _categorieService: CategorieService,
              private readonly _userServiceService: UserServiceService) {
  }

  ngOnInit(): void {
  }

  openExpense() {
    this.router.navigate(['travels', this.expense.tripId, "expense", this.expense.id]);
  }

  getBackgroundColorFor(categorie: string | undefined): string {
    if(categorie === undefined) {
      return "";
    }

    return "#" + this._categorieService.getBackgroundColorFor(categorie);
  }

  private getIsOurExpense() {
    let val: boolean = false;
    if(!this._expense) {
      return false;
    }
    else {
      const myInvites: InviteDate[] | undefined = this._userServiceService._connectedUser.getValue()?.invites;
      if(!myInvites) {
        return false;
      }
      const targetInvite: InviteDate | undefined = myInvites.find((inv: InviteDate) => {
        return inv.tripID === this._expense.tripId;
      });

      if(!targetInvite || !targetInvite?.nameInTrip) {
        return false;
      }
      return this._expense.allPayees.includes(targetInvite?.nameInTrip);
    }
  }
}
