import { ComponentFixture, TestBed } from '@angular/core/testing';

import {IRepartitionItem, RepartitionComponent} from './repartition.component';
import {ExpenseModel} from "../models/expense-model";
import {RepartitionCardComponent} from "../repartition-card/repartition-card.component";
import {ActivatedRoute} from "@angular/router";

import {getExpensesBug, getExpensesMarseille} from "../../test-data/getEzxpenses";
import {checkArray, RepartitionUtils, sanityCheck} from "../../test-data/test_utils";
import lacDeps from "src/test-data/expensesLacanau2021.json";

describe('RepartitionComponentMain', () => {
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

  function checkOwedLessThanSpent(dep: ExpenseModel[]) {
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
      const totalSpent = dep.filter(d => d.payer === owed.name)
        .reduce((res, item) => {
          return res + item.amount;
        }, 0);

      console.log(`${owed.name} spent ${totalSpent}`);
      if(owed.amount > totalSpent) {
        throw new Error(`${owed.name} is owed more than spent: owed=${owed.amount.toFixed(2)} spent =${totalSpent.toFixed(2)}`);
      }
    }
  }

  function checkBugRepart() {
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
      sanityCheck(component.allDeps, component.expenses, expected);
    }
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

  it('should get Marseille repartition properly BUG', () => {
      expect(component).toBeTruthy();

      const exp = getExpensesMarseille();

      const i = 3;

     `` // for(let i = 1; i < exp.length; ++i) {
      console.log("i: " + i);

      component.expenses = exp.slice(0, Math.min(i, exp.length)); // FIXME remove slice
      fixture.detectChanges();

      const expected: any[] = [
        {
          "person": "Elyan",
          "owesTo": "Dju",
          "amount": 17.30
        }
      ];

      console.log("Expenses:");
      console.log(JSON.stringify(component.expenses, null, 2));
      console.log("Repart:");
      console.log(JSON.stringify(component.allDeps, null, 2));

      RepartitionUtils.checkBalanceRepart(component.expenses, component.allDeps);
      // sanityCheck(component.allDeps, component.expenses, expected);
      // checkArray(component.allDeps, expected);
    // }
  });

  it('should not be owed more than spent BUG', () => {
    expect(component).toBeTruthy();
    const dep: ExpenseModel[] = getExpensesBug();

    component.expenses = dep.slice();
    fixture.detectChanges();

    checkOwedLessThanSpent(dep);
    RepartitionUtils.checkBalanceRepart(component.expenses, component.allDeps);
  });

//   it('should do repart for BUG', () => {
//     // FIXME
//     expect(component).toBeTruthy();
//     const dep = getExpensesBug();
//
//     component.expenses = dep.slice();
//     fixture.detectChanges();
//
//     checkBugRepart();
//     RepartitionUtils.checkBalanceRepart(component.expenses, component.allDeps);
//   });
//
  it('should get Lacanau repartition properly BUG', () => {
    // FIXME
    expect(component).toBeTruthy();
    const dep: ExpenseModel[] = (lacDeps as any[]).slice();

    component.expenses = dep.slice();
    fixture.detectChanges();

    const expected: any[] = [];

    const checkArrayFailed = expected.length > 0
      ? checkArray(component.allDeps, expected, false)
      : true;

    if(checkArrayFailed) {
      // sanityCheck(component.allDeps, component.expenses, expected);
      RepartitionUtils.checkBalanceRepart(component.expenses, component.allDeps);
    }

    console.log(JSON.stringify(component.allDeps, null, 2));
  });

});
