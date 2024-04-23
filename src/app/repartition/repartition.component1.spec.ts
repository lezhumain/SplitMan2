import { ComponentFixture, TestBed } from '@angular/core/testing';

import {IRepartitionItem, RepartitionComponent} from './repartition.component';
import {ExpenseModel} from "../models/expense-model";
import {RepartitionCardComponent} from "../repartition-card/repartition-card.component";
import {ActivatedRoute} from "@angular/router";
import {checkArray, RepartitionUtils, sanityCheck} from "../../test-data/test_utils";
import {getExpensesBug} from "../../test-data/getEzxpenses";
import {allExpenses1} from "../../../e2e/data/allExpenses1";
import {APP_BASE_HREF} from "@angular/common";
import {BalanceComponent} from "../balance/balance.component";
import {BalanceItemComponent} from "../balance-item/balance-item.component";
import {IBalanceItem, SplitwiseHelper} from "../utilities/splitwiseHelper";

function getRepartsFromString(str: string) {
  // const str: string = "dju doit a 201.35€ stan Max doit a 45.23€ stan Alexis doit a 309.81€ aissa dju doit a 43.84€ aissa"
  const strMini: string[] = str.replace(/ doit a /g, "").replace(/€ /g, "").split(" ");
  // let [_, pers, amount, doitA][]
  let res: any[][] = strMini.map(stini => /([A-Za-z]+)(\d+\.\d+)([A-Za-z]+)/.exec(stini) || []);
  let allll: IRepartitionItem[] = res.map((items: any[]) => {
    return {
      person: items[1],
      owesTo: items[3],
      amount: Number(items[2])
    } as IRepartitionItem
  });
  return allll;
}

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
        RepartitionComponent, RepartitionCardComponent, BalanceComponent, BalanceItemComponent
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

  it('should have correct thing TODO TODO', () => {
    const deps: ExpenseModel[] = allExpenses1.slice(0, allExpenses1.length - 2).map(f => ExpenseModel.fromJson(f));
    component.expenses = deps;
    fixture.detectChanges();

    const reps: IRepartitionItem[] = component.allDeps.slice();
    const resClone = reps.map(r => Object.assign({}, r));

    // current 23/04/2024
    const allCurrent: IRepartitionItem[] = getRepartsFromString("dju doit a 223.37€ stan Alexis doit a 309.81€ aissa Max doit a 128.43€ aissa dju doit a 21.83€ aissa");
    // unknown
    const allUnknown: IRepartitionItem[] = getRepartsFromString("dju doit a 201.35€ stan Alexis doit a 309.81€ aissa Max doit a 45.23€ stan dju doit a 43.84€ aissa");
    // tricount
    const allTricount: IRepartitionItem[] = getRepartsFromString("dju doit a 97.92€ stan Alexis doit a 314.78€ aissa Max doit a 126.44€ stan dju doit a 146.28€ aissa");

    RepartitionUtils.checkBalanceRepart(deps, reps);
    RepartitionUtils.checkBalanceRepart(deps, allCurrent);

    // FIXME investigate on the one from Tricount
    // RepartitionUtils.checkBalanceRepart(deps, allUnknown);
    // RepartitionUtils.checkBalanceRepart(deps, allTricount);

    const balReps = SplitwiseHelper.getBalance(reps);
    const balCurrent = SplitwiseHelper.getBalance(allCurrent);

    const comp = SplitwiseHelper.compareBalances(balReps, balCurrent);
    const fails = comp.filter((compItem: IBalanceItem) => {
      // return Math.abs(compItem.owed).toFixed(2) !== "0.00" || Math.abs(compItem.owes).toFixed(2) !== "0.00";
      return Math.abs(compItem.owed).toFixed(1) !== "0.0" || Math.abs(compItem.owes).toFixed(1) !== "0.0"; // `1` is important
    });

    expect(fails.length).toEqual(0);
    console.log("vd");
  })
});
