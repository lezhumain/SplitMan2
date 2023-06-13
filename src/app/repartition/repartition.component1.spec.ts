import { ComponentFixture, TestBed } from '@angular/core/testing';

import {IRepartitionItem, RepartitionComponent} from './repartition.component';
import {ExpenseModel} from "../models/expense-model";
import {RepartitionCardComponent} from "../repartition-card/repartition-card.component";
import {ActivatedRoute} from "@angular/router";

import {getExpensesBug} from "../../test-data/getEzxpenses";
import {checkArray, RepartitionUtils, sanityCheck} from "../../test-data/test_utils";

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
      sanityCheck(component.allDeps, component.expenses, expected);
    }
  });
});
