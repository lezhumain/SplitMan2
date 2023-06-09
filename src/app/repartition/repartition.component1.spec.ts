import { ComponentFixture, TestBed } from '@angular/core/testing';

import {IRepartitionItem, RepartitionComponent} from './repartition.component';
import {ExpenseModel} from "../models/expense-model";
import {RepartitionCardComponent} from "../repartition-card/repartition-card.component";
import {ActivatedRoute} from "@angular/router";

import {getExpensesBug} from "../../test-data/getEzxpenses";
import {checkArray, RepartitionUtils} from "../../test-data/test_utils";

describe('RepartitionComponent1', () => {
  let component: RepartitionComponent;
  let fixture: ComponentFixture<RepartitionComponent>;
  const fakeActivatedRoute = <any>{
    snapshot: {
      data: {},
      paramMap: {
        get: (name: string) => {
          return 1
        }
      }
    }
  } as ActivatedRoute;

  function checkTotalsEqualOwed() {
    console.log("checking total owed");

    const done: string[] = [];

    for(const dep of component.allDeps) {
      if(done.includes(dep.owesTo)) {
        continue;
      }
      const allOwedFromRepart = component.allDeps.filter(c => c.owesTo === dep.owesTo)
        .reduce((res, item) => {
          res += item.amount;
          return res;
        }, 0);
      const allOwedExpected = RepartitionUtils.getOwed(component.expenses, dep.owesTo);

      console.log(`\t${dep.owesTo} Expected ${allOwedExpected}: ${allOwedFromRepart}`);
      expect(allOwedFromRepart).toEqual(allOwedExpected);
      done.push(dep.owesTo);
    }

    console.log("done checking total owed");
  }


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // imports: [ RouterTestingModule ],
      declarations: [
        RepartitionComponent, RepartitionCardComponent
      ],
      providers: [
        {provide: ActivatedRoute, useValue: fakeActivatedRoute}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RepartitionComponent);
    component = fixture.componentInstance;

    // component.expenses = getExpenses();
    fixture.detectChanges();
  });

  function getTotalFromRepart(me: string, rep?: IRepartitionItem[]) {
    if (rep === undefined) {
      rep = component.allDeps;
    }

    return rep.reduce((r, i) => {
      if(i.owesTo === me || i.person === me) {
        r += i.amount;
      }
      return r;
    }, 0);
  }

  it('should not be owed more than spent', () => {
    expect(component).toBeTruthy();

    const dep: ExpenseModel[] = getExpensesBug();

    component.expenses = dep.slice();
    fixture.detectChanges();

    const areOwed = component.allDeps.reduce((res: {name: string, amount: number}[], item: IRepartitionItem) => {
      const existing = res.find(r => r.name === item.owesTo);
      if(!existing) {
        res.push({name: item.owesTo, amount: item.amount});
      }
      else {
        existing.amount += item.amount;
      }
      return res;
    }, []);

    const target = fixture.debugElement.nativeElement.querySelector(".repart").parentNode;
    const content = target.textContent;

    for(const owed of areOwed) {
      const totalSpentFromExpenses = dep.filter(d => d.payer === owed.name)
        .reduce((res, item) => {
          return res + item.amount;
        }, 0);

      const epxectedOwed = RepartitionUtils.getOwed(dep, owed.name);
      console.log(`${owed.name} owed=${owed.amount.toFixed(2)} (${epxectedOwed.toFixed(2)}) spent =${totalSpentFromExpenses.toFixed(2)}`);
      if(owed.amount > totalSpentFromExpenses) {
        throw new Error(`${owed.name} is owed more than spent`);
      }
    }

    checkTotalsEqualOwed();

    const expected: IRepartitionItem[] = [
      {
        "person": "cam",
        "owesTo": "alx",
        "amount": 18
      },
      {
        "person": "maxk",
        "owesTo": "alx",
        "amount": 13
      },
      {
        "person": "maxk",
        "owesTo": "dju",
        "amount": 79
      }
    ];


    const checkArrayFailed = checkArray(component.allDeps, expected, false);
    if(checkArrayFailed) {
      const allUsers: string[] = component.allDeps.reduce((res: string[], item: IRepartitionItem) => {
        if(!res.includes(item.person)) {
          res.push(item.person);
        }

        if(!res.includes(item.owesTo)) {
          res.push(item.owesTo);
        }

        return res;
      }, []);

      const all = [];
      for(const user of allUsers) {
        const u = user;
        const datad = RepartitionUtils.getOwedAll(component.expenses, user);

        // usrObj.totalSpentForOthers = datad.iPaidForOthers;
        // usrObj.totalSpentForSelf = 0;
        // usrObj.totalOwed = datad.owed;
        // usrObj.totalPaidByOthersForSelf = datad.othersPaidForMe;
        // console.log("u");
        // usrObj.user = u;

        const oobj = {
          user: u,
          totalSpent: datad.iPaidForMe + datad.iPaidForOthers,
          totalSpentForSelf: datad.iPaidForMe,
          totalSpentForOthers: datad.iPaidForOthers,
          totalOwed: datad.owed,
          totalPaidByOthersForSelf: datad.othersPaidForMe,
          totalFromRepart: getTotalFromRepart(u),
          totalFromRepartExpect: getTotalFromRepart(u, expected)
        };
        all.push(oobj);
      }

      console.log(JSON.stringify(all, null, 2));
      for(const oobj of all) {
        expect(Math.abs(oobj.totalOwed)).toEqual(oobj.totalFromRepart);
        expect(oobj.totalFromRepartExpect).toEqual(oobj.totalFromRepart);
        expect(oobj.totalSpent).toEqual(oobj.totalOwed + oobj.totalPaidByOthersForSelf);
      }
      debugger;
    }
  });

  // TODO maybe un-comment this
  // it('should be owed what they spent', () => {
  //   expect(component).toBeTruthy();
  //
  //   // const dep0 = <any>depLac as ExpenseModel[];
  //   // const dep1 = <any>depLac.slice(0, depLac.length - 33) as ExpenseModel[]; // 18
  //   // const dep = <any>depLac.slice(0, depLac.length - 32) as ExpenseModel[]; // 18
  //   const dep = getExpensesBug();
  //
  //
  //   component.expenses = dep.slice();
  //   fixture.detectChanges();
  //
  //   const areOwed = component.allDeps.reduce((res: {name: string, amount: number}[], item: IRepartitionItem) => {
  //     const existing = res.find(r => r.name === item.owesTo);
  //     if(!existing) {
  //       res.push({name: item.owesTo, amount: item.amount});
  //     }
  //     else {
  //       existing.amount += item.amount;
  //     }
  //     return res;
  //   }, []);
  //
  //   const target = fixture.debugElement.nativeElement.querySelector(".repart").parentNode;
  //   const content = target.textContent;
  //
  //   for(const owed of areOwed) {
  //     const totalSpent = dep.filter(d => d.payer === owed.name)
  //       .reduce((res, item) => {
  //         return res + item.amount;
  //       }, 0);
  //
  //     if(owed.amount !== totalSpent) {
  //       throw new Error(`${owed.name} is own wrong amount: owed=${owed.amount.toFixed(2)} spent =${totalSpent.toFixed(2)}`);
  //     }
  //   }
  // });

  // it('should handle A -> C, A -> B, C -> Av (mini)', () => {
  //   expect(component).toBeTruthy();
  //
  //   // component.expenses = getExpensesACCBBA();
  //   // fixture.detectChanges();
  //
  //   const expected: IRepartitionItem[] = [
  //     {
  //       "person": "cam ",
  //       "owesTo": "alx",
  //       "amount": 18
  //     },
  //     {
  //       "person": "maxk",
  //       "owesTo": "alx",
  //       "amount": 13
  //     },
  //     {
  //       "person": "maxk",
  //       "owesTo": "dju",
  //       "amount": 79
  //     }
  //   ];
  //   const start: IRepartitionItem[] =   [
  //     {
  //       "person": "dju ",
  //       "owesTo": "alx",
  //       "amount": 3
  //     },
  //     {
  //       "person": "cam",
  //       "owesTo": "alx",
  //       "amount": 3
  //     },
  //     {
  //       "person": "maxk",
  //       "owesTo": "alx",
  //       "amount": 3
  //     },
  //     {
  //       "person": "dju ",
  //       "owesTo": "alx",
  //       "amount": 11
  //     },
  //     {
  //       "person": "maxk",
  //       "owesTo": "alx",
  //       "amount": 11
  //     },
  //     {
  //       "person": "cam",
  //       "owesTo": "dju ",
  //       "amount": 57
  //     },
  //     {
  //       "person": "maxk",
  //       "owesTo": "dju ",
  //       "amount": 57
  //     },
  //     {
  //       "person": "dju ",
  //       "owesTo": "cam",
  //       "amount": 21
  //     },
  //     {
  //       "person": "maxk",
  //       "owesTo": "cam",
  //       "amount": 21
  //     }
  //   ];
  //   const res = component["handleRepartition"](start);
  //
  //   debugger;
  //   checkArray(res, expected);
  // });
});
