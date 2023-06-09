import { ComponentFixture, TestBed } from '@angular/core/testing';

import {IRepartitionItem, RepartitionComponent} from './repartition.component';
import {ExpenseModel} from "../models/expense-model";
import {RepartitionCardComponent} from "../repartition-card/repartition-card.component";
import {ActivatedRoute} from "@angular/router";

import {getExpensesBug, getExpensesMarseille} from "../../test-data/getEzxpenses";
import {checkArray} from "../../test-data/test_utils";


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
        "person": "cam ",
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

    debugger;
    checkArray(component.allDeps, expected);
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

    component.expenses = getExpensesMarseille();
    fixture.detectChanges();

    const expected: any[] = [
      {
        "person": "Elyan",
        "owesTo": "Dju",
        "amount": 17.30
      }
    ];

    checkArray(component.allDeps, expected);
  });

  it('should not be owed more than spent BUG', () => {
    expect(component).toBeTruthy();
    const dep: ExpenseModel[] = getExpensesBug();

    component.expenses = dep.slice();
    fixture.detectChanges();

    checkOwedLessThanSpent(dep);
  });

  it('should do repart for BUG', () => {
    // // FIXME
    // expect(component).toBeTruthy();
    // const dep = getExpensesBug();
    //
    // component.expenses = dep.slice();
    // fixture.detectChanges();
    //
    // checkBugRepart();
  });
});
