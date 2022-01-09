import { Component, OnInit } from '@angular/core';
import {TravelModel} from "../models/travel-model";
import {TravelService} from "../travel.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Travel} from "../models/travel";
import {Expense} from "../models/expense";
import {ExpenseService} from "../expense.service";
import {BehaviorSubject, combineLatest, Observable, of, Subject} from "rxjs";
import {ExpenseModel} from "../models/expense-model";
import {NavBarService} from "../nav-bar.service";
import {UserServiceService} from "../user-service.service";
import {InviteDate, UserModel} from "../models/user-model";
import {filter, first, map, takeWhile, tap} from "rxjs/operators";
import {flatMap} from "rxjs/internal/operators";
import {ToastComponent} from "../toast/toast.component";
import {ToastType} from "../toast/toast.shared";
// import {File} from "@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system";

@Component({
  selector: 'app-travel',
  templateUrl: './travel.component.html',
  styleUrls: ['./travel.component.css']
})
export class TravelComponent implements OnInit {
  // connectedUser$: Observable<UserModel | null> | null = null;
  connectedUser$: BehaviorSubject<UserModel | null> = new BehaviorSubject<UserModel | null>(null);

  travel: TravelModel = new TravelModel();
  expenses: ExpenseModel[] = [];

  whoAmi: string = "";
  whoAmiSelect: string = "";
  private alive = true;
  private connectedUserInvite$: Observable<InviteDate | null> = of(null);

  file: File | null = null;

  constructor(private readonly travelService: TravelService,
              private readonly expenseService: ExpenseService,
              private readonly userServiceService: UserServiceService,
              private readonly router: Router,
              private readonly route: ActivatedRoute,
              private _navService: NavBarService) { }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    const paramID: string | null = routeParams.get('travelID');
    const travelID: number | null = paramID === null ? null : Number(paramID);

    // this.mode = travelID === null ? EditMode.Edit : EditMode.Create;

    if(travelID !== null) {

      this.userServiceService.getConnectedUser().pipe(
        takeWhile(() => this.alive)
      ).subscribe((u: UserModel | null) => {
        this.connectedUser$.next(u);
      });

      const obs = [
        this.travelService.getTravelByID(travelID),
        this.expenseService.getExpensesByTripID(travelID),
        this.connectedUser$
      ];

      // combineLatest(obs).subscribe(([t, expenses]: [Travel | null, Expense[]]) => {
      combineLatest(obs).pipe(
        takeWhile(() => this.alive)
      ).subscribe((res: any[]) => {
        const t: Travel | null = res[0],
          expenses: Expense[] = res[1],
          user: UserModel | null = res[2];

        if (t) {
          this.travel = t;
          this._navService.setHeaderValue(t.name);

          const targetInvite = user?.invites ? user?.invites.find(i => i.tripID === t.id) : null;
          if(targetInvite) {
            this.whoAmi = targetInvite.nameInTrip || "";
          }
        }

        this.expenses = expenses.map(e => ExpenseModel.fromExpense(e));
      });

      // this.connectedUser$.subscribe((u) => {
      //   if(!u) {
      //     return;
      //   }
      //
      //   const targetInvite =
      // });

      this.connectedUserInvite$ = this.connectedUser$.pipe(
        map(u => u?.invites?.find(i => i.tripID === this.travel.id) || null)
      );
    }

    this._navService.setBackValue(`/travels`);
  }

  ngOnDestroy() {
    this.alive = false;
  }

  newExpense() {
    this.router.navigate(['travels', this.travel.id, "expense", "new"]);
  }

  newPerson(name?: string, isDelete = false) {
    if (!isDelete) {
      if (name) {
        name = encodeURI(name);
      }
      this.router.navigate(['travels', this.travel.id, "participants", name ? name : "new"]);
    }
    else {
      if(!name) {
        return;
      }
      this.travelService.deleteParticipant(name, this.travel.id)
        .subscribe(() => {
          this.travel.participants = this.travel.participants?.filter(p => p.name !== name);
          ToastComponent.toastdata$.next({type: ToastType.SUCCESS, message: "Participant removed successfully."});
        }, () => {
          ToastComponent.toastdata$.next({type: ToastType.ERROR, message: "Error removing participant."});
        });
    }
  }

  travelHasParticipants(): boolean {
    return !!(this.travel.participants && this.travel.participants.length > 0);
  }

  invite() {
    this.router.navigate(['travels', this.travel.id, "invite"]);
  }

  getParticipants(): string[] | null {
    return this.travel.participants ? this.travel.participants.map(a => a.name) : null;
  }

  saveSelfName() {
    this.connectedUser$?.pipe(
      filter(u => !!u),
      first(),
      flatMap((u: UserModel | null) => {
        if(!u?.invites) {
          return of(null);
        }

        const target = u.invites.find(i => i.tripID === this.travel.id);
        if(!target) {
          return of(null);
        }

        target.nameInTrip = this.whoAmiSelect;

        return this.userServiceService.updateUserInvite(target, u.id, false);
      })
    ).subscribe(() => {
      console.log("Added to trip");
    });
  }

  isUs(name: string): Observable<boolean> {
    return this.connectedUserInvite$.pipe(
      map((i: InviteDate | null) => {
        return !!i && i.nameInTrip === name;
      })
    );
  }

  private expensesToCSV(): string {
    return this.expenses[0].toCSV();
  }

  downloadAsCSV() {
    const textToSave: string = ExpenseModel.toCSV(this.expenses);

    const hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:attachment/text,' + encodeURI(textToSave);
    hiddenElement.target = '_blank';
    hiddenElement.download = `expenses_${this.travel.id}.csv`;
    hiddenElement.click();
  }

  uploadCSV(): void {
    // debugger;
    if (!this.file) {
      return;
    }

    const reader = new FileReader();

    const subj: Subject<string> = new Subject<string>();

    // If we use onloadend, we need to check the readyState.
    reader.onloadend = function(evt: ProgressEvent<FileReader>) {
      if (evt.target && evt.target.readyState == FileReader.DONE) { // DONE == 2
        const a = evt.target.result;
        // debugger;
        subj.next(a ? a.toString() : "");
      }
    };

    // var blob = file.slice(start, stop + 1);
    reader.readAsText(this.file);

    subj.pipe(
      first(),
      // map((res: string) => {
      //   debugger;
      //   return null;
      // })
      flatMap((res: string) => {
        if(!res) {
          return of([]);
        }
        const elems = ExpenseModel.fromCSV(res);

        const all = this.expenses.slice();
        for(let el of elems) {
          el.tripId = this.travel.id;
          const index = all.findIndex(o => o.id === el.id);
          if(index > -1) {
            all.splice(index, 1, el);
          }
          else {
            all.push(el);
          }
        }

        // debugger;
        return this.expenseService.saveExpenses(all, this.userServiceService).pipe(
          map(() => all)
        );
      })
    ).subscribe((all: ExpenseModel[]) => {
      console.log("done");
      this.expenses = all.slice();
    });
  }

  csvFileChanged(event: Event) {
    const files: FileList | null = (<HTMLInputElement>event.target).files;
    const file: File | null = files && files.length > 0 ? files[0] : null;

    this.file = file;
    // debugger;
  }

  hasExpenses(name: string): boolean {
    return this.expenses.some(e => e.payer === name || e.payees.some(ep => ep.name === name));
  }
}
