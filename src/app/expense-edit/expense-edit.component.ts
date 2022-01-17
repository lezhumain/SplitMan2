import { Component, OnInit } from '@angular/core';
import {ExpenseModel} from "../models/expense-model";
import {Travel} from "../models/travel";
import {TravelService} from "../travel.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Expense} from "../models/expense";
import {ExpenseService} from "../expense.service";
import {UserServiceService} from "../user-service.service";
import {combineLatest, of} from "rxjs";
import {Participant, ParticipantModel} from "../models/participants";
import {ExpenseParticipantModel} from "../models/expenseParticipants";
import {NavBarService} from "../nav-bar.service";

@Component({
  selector: 'app-expense-edit',
  templateUrl: './expense-edit.component.html',
  styleUrls: ['./expense-edit.component.css']
})
export class ExpenseEditComponent implements OnInit {
  expenseModel: ExpenseModel = new ExpenseModel();
  travelUsers: ParticipantModel[] = [];

  expParts: ExpenseParticipantModel[] = [];
  savingExpense = false;

  private _isPerDay = false;
  set isPerDay(v: boolean) {
    this._isPerDay = v;
    if(v) {
      const toSetSelected = [];
      this.expParts.forEach((ep: ExpenseParticipantModel) => {
        const target = this.travelUsers.find(tv => tv.name === ep.name);
        if(!target) {
          ep.e4xpenseRatio = 0;
          ep.selected = false;
        }
        else {
          ep.e4xpenseRatio = target.ratio;
          ep.selected = true;
        }
      });
    }
  }
  get isPerDay(): boolean {
    return this._isPerDay;
  }

  constructor(private readonly expenseService: ExpenseService,
              private readonly travelService: TravelService,
              private readonly userServiceService: UserServiceService,
              private readonly router: Router,
              private readonly route: ActivatedRoute,
              private readonly _navService: NavBarService) { }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    const paramID: string | null = routeParams.get('travelID');
    const travelID: number | null = paramID === null ? null : Number(paramID);
    const paramIDex: string | null = routeParams.get('expenseID');
    const expenseID: number | null = paramIDex === null ? null : Number(paramIDex);

    if(travelID === null) {
      // TODO display error
      return;
    }

    // this.mode = travelID === null ? EditMode.Edit : EditMode.Create;

    // this.expenseService.getExpenseByIDandTrip(expenseID, travelID).subscribe((t: Expense | null) => {
    //   if (t) {
    //     this.expenseModel = ExpenseModel.fromExpense(t);
    //   }
    // });

    // this.expenseService.getExpensesByTripID(travelID).subscribe((t: Expense[] | null) => {
    //   if (t) {
    //     const dep = t.find(o => o.id === expenseID);
    //     if (dep) {
    //       this.expenseModel = ExpenseModel.fromExpense(dep);
    //     }
    //
    //     // let travelUsers: string[] = t.map(o => o.payer).concat(
    //     //   t.map(o => o.payees).reduce((res, item) => {
    //     //     res = res.concat(item);
    //     //     return res;
    //     //   }, [])
    //     // );
    //     //
    //     // travelUsers = travelUsers.filter((tu: string, index: number) => !!tu && travelUsers.indexOf(tu) === index)
    //     // this.travelUsers = travelUsers;
    //
    //     this.travelUsers = this.
    //
    //     if(this.expenseModel && (!this.expenseModel.payees || this.expenseModel.payees.length === 0)) {
    //       this.expenseModel.payees = travelUsers.slice();
    //     }
    //   }
    // });


    combineLatest([
      this.travelService.getTravelByID(travelID),
      expenseID !== null ? this.expenseService.getExpenseByIDandTrip(expenseID, travelID) : of(null)
    ]).subscribe(([travel, t]: [Travel | null, Expense | null]) => {
      if(!travel) {
        return;
      }

      if (t) {
        this.expenseModel = ExpenseModel.fromExpense(t);
      }

      this.travelUsers = travel?.participants?.map(p => ParticipantModel.from(p)) || [];

      const allExParts = this.travelUsers.map((a: ParticipantModel, index: number, all: ParticipantModel[]) => {
        const mo: ExpenseParticipantModel = new ExpenseParticipantModel();
        mo.name = a.name;
        // mo.selected = !t;
        mo.selected = false;
        mo.e4xpenseRatio = mo.selected ? 1 / all.length : 0;
        return mo;
      });

      if(this.expenseModel && this.expenseModel.payees && this.expenseModel.payees.length > 0) {
        const temp = this.expenseModel.payees.map(e => {
          e.selected = e.e4xpenseRatio !== 0;
          return e;
        });
        const allRemaining = allExParts.filter(aep => !temp.some(ep => ep.name === aep.name));

        this.expParts = temp.concat(allRemaining);
      }
      else {
        this.expParts = allExParts;
      }


      // if(this.expenseModel && (!this.expenseModel.payees || this.expenseModel.payees.length === 0)) {
      //   this.expenseModel.payees = this.travelUsers?.map(a => {
      //     const mo: ExpenseParticipantModel = new ExpenseParticipantModel();
      //     mo.name = a.name;
      //     return mo;
      //   }) || [];
      // }
    });

    this.expenseModel.tripId = travelID;

    this._navService.setBackValue(`/travels/${travelID}/expense/${expenseID}`);
  }

  saveExpense() {
    const filtered = this.expParts.filter(p => !!p.e4xpenseRatio && p.selected);
    const perc = this.getMainRatio(filtered);
    const participants = filtered.map((p: ExpenseParticipantModel) => {
        p.e4xpenseRatio = (p.e4xpenseRatio || 0) * perc;
        return p;
      });
    this.expenseModel.payees = participants;

    this.savingExpense = true;
    this.expenseService.saveExpense(this.expenseModel, this.userServiceService).subscribe(() => {
      // TODO check for failure
      this.savingExpense = false;
      this.router.navigate(['travels', this.expenseModel.tripId]);
    });
  }

  dateChanged1(ev: Event) {
    this.expenseModel.dateStr = (<HTMLInputElement>ev.target).value;
  }

  isUserSelected(user: string): boolean {
    return this.expParts.some(e => e.name === user && e.selected);
  }

  setUserSelected(event: Event, user: string) {
    const checked: boolean = (<HTMLInputElement>event.target).checked;

    // const isContained: boolean = this.expParts.includes(user);
    //
    // if(checked && !isContained) {
    //   this.expParts.push(user);
    // }
    // else if(!checked && isContained) {
    //   const index: number = this.expParts.indexOf(user);
    //   this.expParts.splice(index, 1);
    // }

    const target = this.expParts.find(e => e.name === user);
    if (target) {
      target.selected = checked;
      if(!target.e4xpenseRatio) {
        target.e4xpenseRatio = 1;
      }
    }
  }

  getRatioValue(e4xpenseRatio: number) {
    const perc = this.getMainRatio();
    return this.expenseModel.amount * e4xpenseRatio * perc;
  }

  setSelectedUser(user: ExpenseParticipantModel) {
    user.e4xpenseRatio = Number(user.e4xpenseRatio);
    user.selected = user.e4xpenseRatio > 0;
  }

  private getMainRatio(filtered?: ExpenseParticipantModel[]): number {
    if(!filtered) {
      filtered = this.expParts.slice();
    }
    filtered = filtered.filter(p => !!p.e4xpenseRatio);
    const total = filtered.reduce((res: number, item: ExpenseParticipantModel) => res + (item.e4xpenseRatio || 0), 0);
    const perc = total ? 1 / total : 0;
    return perc;
  }
}
