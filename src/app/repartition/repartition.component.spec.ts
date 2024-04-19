import {ComponentFixture, TestBed} from '@angular/core/testing';

import {IRepartitionItem, RepartitionComponent} from './repartition.component';

import {RepartitionCardComponent} from "../repartition-card/repartition-card.component";
import {getExpenses} from "../models/expense-model.spec";
import {ActivatedRoute} from "@angular/router";

import {getExpenses1, getExpenses2, getExpenses3, getExpensesMarseille} from "../../test-data/getEzxpenses";
import {checkArray, RepartitionUtils} from "../../test-data/test_utils";

import {ExpenseModel} from "../models/expense-model";
import {ExpenseParticipantModel} from "../models/expenseParticipants";
// @ts-ignore
import {SplitwiseHelper} from "../utilities/splitwiseHelper";

describe('RepartitionComponent', () => {
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

  it("splitwise", () => {
    expect(component).toBeTruthy();
    const tot1 = 300 + 40 + 30;
    const tot2 = 50 + 100 + 200;

    const expenses: ExpenseModel[] = [
      {
        payer: 'A',
        amount: tot1,
        payees: [
          ExpenseParticipantModel.from({
            name: "B",
            e4xpenseRatio: 300 / tot1
          }),
          ExpenseParticipantModel.from({
            name: "C",
            e4xpenseRatio: 40 / tot1
          }),
          ExpenseParticipantModel.from({
            name: "D",
            e4xpenseRatio: 30 / tot1
          })
        ]
      } as ExpenseModel,
      {
        payer: 'B',
        amount: tot2,
        payees: [
          ExpenseParticipantModel.from({
            name: "A",
            e4xpenseRatio: 50 / tot2
          }),
          ExpenseParticipantModel.from({
            name: "B",
            e4xpenseRatio: 100 / tot2
          }),
          ExpenseParticipantModel.from({
            name: "C",
            e4xpenseRatio: 200 / tot2
          })
        ]
      } as ExpenseModel
    ];

    const allDeps = SplitwiseHelper.split(expenses);
    RepartitionUtils.checkBalanceRepart(expenses, allDeps);
  });

  it('should load repartition properly', () => {
    expect(component).toBeTruthy();

    component.expenses = getExpenses();
    fixture.detectChanges();

    const expected: any[] = [
      {
        "person": "Cams",
        "owesTo": "Dju",
        "amount": 100
      },
      {
        "person": "Alx",
        "owesTo": "Dju",
        "amount": 80
      }
    ];

    expect(component.allDeps.every(cad => cad.checked)).toEqual(true);
    RepartitionUtils.checkBalanceRepart(component.expenses, component.allDeps);
    checkArray(component.allDeps, expected);
  });

  it('should load repartition properly 1', () => {
    expect(component).toBeTruthy();

    component.expenses = getExpenses1();
    fixture.detectChanges();

    const expected: any[] = [
      {
        "person": "Alx",
        "owesTo": "Cams",
        "amount": 100
      },
      {
        "person": "Alx",
        "owesTo": "Dju",
        "amount": 80
      }
    ];

    expect(component.allDeps.every(cad => cad.checked)).toEqual(true);
    RepartitionUtils.checkBalanceRepart(component.expenses, component.allDeps);
    checkArray(component.allDeps, expected);
  });

  it('should load repartition properly 2', () => {
    expect(component).toBeTruthy();

    const exp = getExpenses2();
    component.expenses = exp;
    fixture.detectChanges();

    const expected: any[] = [
      {
        "person": "Alx",
        "owesTo": "Cams",
        "amount": 70
      },
      {
        "person": "Alx",
        "owesTo": "Dju",
        "amount": 50
      }
    ];

    expect(component.allDeps.every(cad => cad.checked)).toEqual(true);
    RepartitionUtils.checkBalanceRepart(component.expenses, component.allDeps);
    checkArray(component.allDeps, expected);
  });

  it('should load repartition properly 3', () => {
    expect(component).toBeTruthy();

    component.expenses = getExpenses3();
    fixture.detectChanges();

    const expected: any[] = [
      {
        "person": "Alx",
        "owesTo": "Cams",
        "amount": 193.33
      },
      {
        "person": "Dju",
        "owesTo": "Cams",
        "amount": 23.33
      }
    ];

    expect(component.allDeps.every(cad => cad.checked)).toEqual(true);
    RepartitionUtils.checkBalanceRepart(component.expenses, component.allDeps);
    checkArray(component.allDeps, expected);
  });

  it('should handle A -> C, C -> B, B -> A (int values)', () => {
    expect(component).toBeTruthy();

    const expected: IRepartitionItem[] = [];
    const start: IRepartitionItem[] = [
      {
        "person": "Max",
        "owesTo": "Suzie",
        "amount": 1
      },
      {
        "person": "Suzie",
        "owesTo": "Dju",
        "amount": 1
      },
      {
        "person": "Dju",
        "owesTo": "Max",
        "amount": 1
      }
    ];
    const res = component["handleRepartition"](start);

    expect(component.allDeps.every(cad => cad.checked)).toEqual(true);
    RepartitionUtils.checkBalanceRepart(component.expenses, component.allDeps);
    checkArray(res, expected);
  });

  it('should handle A -> C, C -> B, B -> A (float values)', () => {
    expect(component).toBeTruthy();


    const expected: IRepartitionItem[] = [];
    const start: IRepartitionItem[] = [
      {
        "person": "Max",
        "owesTo": "Suzie",
        "amount": 1.0033333333333303
      },
      {
        "person": "Suzie",
        "owesTo": "Dju",
        "amount": 0.9966666666666661
      },
      {
        "person": "Dju",
        "owesTo": "Max",
        "amount": 1
      }
    ];
    const res = component["handleRepartition"](start);

    expect(component.allDeps.every(cad => cad.checked)).toEqual(true);
    RepartitionUtils.checkBalanceRepart(component.expenses, component.allDeps);
    checkArray(res, expected);
  });

  it('should handle A -> C, C -> B, B -> A (int values, not 1)', () => {
    expect(component).toBeTruthy();

    const expected: IRepartitionItem[] = [
      {
        "person": "Max",
        "owesTo": "Dju",
        "amount": 10
      },
      {
        "person": "Suzie",
        "owesTo": "Dju",
        "amount": 20
      }
    ];
    const start: IRepartitionItem[] = [
      {
        "person": "Max",
        "owesTo": "Suzie",
        "amount": 40
      },
      {
        "person": "Suzie",
        "owesTo": "Dju",
        "amount": 60
      },
      {
        "person": "Dju",
        "owesTo": "Max",
        "amount": 30
      }
    ];
    const res = component["handleRepartition"](start);

    expect(component.allDeps.every(cad => cad.checked)).toEqual(true);
    RepartitionUtils.checkBalanceRepart(component.expenses, component.allDeps);
    checkArray(res, expected);
  });

  it('should handle A -> C, A -> B, C -> A (int values, not 1)', () => {
    expect(component).toBeTruthy();

    const expected: IRepartitionItem[] = [
      {
        "person": "max",
        "owesTo": "alx",
        "amount": 34
      },
      {
        "person": "max",
        "owesTo": "cam",
        "amount": 2
      }
    ];
    const start: IRepartitionItem[] = [
      {
        "person": "max",
        "owesTo": "alx",
        "amount": 15
      },
      {
        "person": "cam",
        "owesTo": "alx",
        "amount": 19
      },
      {
        "person": "max",
        "owesTo": "cam",
        "amount": 21
      }
    ];
    const res = component["handleRepartition"](start);

    expect(component.allDeps.every(cad => cad.checked)).toEqual(true);
    RepartitionUtils.checkBalanceRepart(component.expenses, component.allDeps);
    checkArray(res, expected);
  });

  it('should get spent properly', () => {
    expect(component).toBeTruthy();

    component.expenses = getExpensesMarseille().slice(0, 2);
    fixture.detectChanges();

    const target = fixture.debugElement.nativeElement.querySelector("#spendWrapper .container");
    const content = target.textContent;

    RepartitionUtils.checkBalanceRepart(component.expenses, component.allDeps);
    expect(content).toEqual("Dju10.700.00 /jMax10.700.00 /jElyan10.700.00 /jSuzie10.700.00 /j");
  });

  it('should not display 0', () => {
    expect(component).toBeTruthy();

    component.expenses = [
      <any>{
        payer: "d",
        amount: 1,
        name: "name",
        payees: [
          ExpenseParticipantModel.from({
            name: "B",
            e4xpenseRatio: 0.5
          }),
          ExpenseParticipantModel.from({
            name: "d",
            e4xpenseRatio: 0.5
          })
        ]
      } as ExpenseModel
    ];
    fixture.detectChanges();

    let targets = fixture.debugElement.nativeElement.querySelectorAll("app-repartition-card");
    expect(targets.length).toEqual(1);


    component.expenses = [
      <any>{
        payer: "d",
        amount: 1,
        name: "name",
        payees: [
          ExpenseParticipantModel.from({
            name: "B",
            e4xpenseRatio: 0.5
          }),
          ExpenseParticipantModel.from({
            name: "d",
            e4xpenseRatio: 0.5
          })
        ]
      } as ExpenseModel,
      <any>{
        payer: "B",
        amount: 1,
        name: "name",
        payees: [
          ExpenseParticipantModel.from({
            name: "B",
            e4xpenseRatio: 0.5
          }),
          ExpenseParticipantModel.from({
            name: "d",
            e4xpenseRatio: 0.5
          })
        ]
      } as ExpenseModel
    ];
    fixture.detectChanges();

    targets = fixture.debugElement.nativeElement.querySelectorAll("app-repartition-card");
    expect(targets.length).toEqual(0);
  });
});
