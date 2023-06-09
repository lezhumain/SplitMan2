import { ComponentFixture, TestBed } from '@angular/core/testing';

import {IRepartitionItem, RepartitionComponent} from './repartition.component';
import {ExpenseModel} from "../models/expense-model";
import {RepartitionCardComponent} from "../repartition-card/repartition-card.component";
import {getExpenses} from "../models/expense-model.spec";
import {ActivatedRoute} from "@angular/router";

import {ExpenseParticipantModel} from "../models/expenseParticipants";
import {getExpenses1, getExpenses2, getExpenses3, getExpensesMarseille} from "../../test-data/getEzxpenses";
import {checkArray} from "../../test-data/test_utils";

// function getExpensesMarseille(): ExpenseModel[] {
//   return [
//     {
//       "id": 2,
//       "tripId": 13,
//       "name": "Autoroute",
//       "amount": 14.8,
//       "date": "2021-11-12T01:12:32.454Z",
//       "payer": "Suzie",
//       "payees": [
//         {
//           "name": "Dju",
//           "selected": true,
//           "e4xpenseRatio": 0.25
//         },
//         {
//           "name": "Max",
//           "selected": true,
//           "e4xpenseRatio": 0.25
//         },
//         {
//           "name": "Elyan",
//           "selected": true,
//           "e4xpenseRatio": 0.25
//         },
//         {
//           "name": "Suzie",
//           "selected": true,
//           "e4xpenseRatio": 0.25
//         }
//       ],
//       "createdAt": "2021-11-12T01:12:54.842Z",
//       "createdBy": "a",
//       "updatedAt": "2021-11-13T16:27:17.320Z",
//       "updatedBy": "a"
//     },
//     {
//       "id": 3,
//       "tripId": 13,
//       "name": "Essence",
//       "amount": 28,
//       "date": "2021-11-12T01:12:56.459Z",
//       "payer": "Suzie",
//       "payees": [
//         {
//           "name": "Dju",
//           "selected": true,
//           "e4xpenseRatio": 0.25
//         },
//         {
//           "name": "Max",
//           "selected": true,
//           "e4xpenseRatio": 0.25
//         },
//         {
//           "name": "Elyan",
//           "selected": true,
//           "e4xpenseRatio": 0.25
//         },
//         {
//           "name": "Suzie",
//           "selected": true,
//           "e4xpenseRatio": 0.25
//         }
//       ],
//       "createdAt": "2021-11-12T01:13:16.809Z",
//       "createdBy": "a",
//       "updatedAt": "2021-11-13T16:27:17.320Z",
//       "updatedBy": "a"
//     },
//     {
//       "id": 4,
//       "tripId": 13,
//       "name": "Glace",
//       "amount": 14,
//       "date": "2021-11-12T01:14:04.454Z",
//       "payer": "Dju",
//       "payees": [
//         {
//           "name": "Dju",
//           "selected": true,
//           "e4xpenseRatio": 0.25
//         },
//         {
//           "name": "Max",
//           "selected": true,
//           "e4xpenseRatio": 0.25
//         },
//         {
//           "name": "Elyan",
//           "selected": true,
//           "e4xpenseRatio": 0.25
//         },
//         {
//           "name": "Suzie",
//           "selected": true,
//           "e4xpenseRatio": 0.25
//         }
//       ],
//       "createdAt": "2021-11-12T01:14:17.565Z",
//       "createdBy": "a",
//       "updatedAt": "2021-11-13T16:27:17.320Z",
//       "updatedBy": "a"
//     },
//     {
//       "id": 5,
//       "tripId": 13,
//       "name": "Tacos",
//       "amount": 27,
//       "date": "2021-11-12T01:14:28.582Z",
//       "payer": "Max",
//       "payees": [
//         {
//           "name": "Dju",
//           "selected": true,
//           "e4xpenseRatio": 0.5
//         },
//         {
//           "name": "Max",
//           "selected": true,
//           "e4xpenseRatio": 0.5
//         }
//       ],
//       "createdAt": "2021-11-12T01:14:52.103Z",
//       "createdBy": "a",
//       "updatedAt": "2021-11-13T16:27:17.320Z",
//       "updatedBy": "a"
//     },
//     {
//       "id": 6,
//       "tripId": 13,
//       "name": "Pizza",
//       "amount": 44,
//       "date": "2021-11-12T01:15:04.094Z",
//       "payer": "Dju",
//       "payees": [
//         {
//           "name": "Dju",
//           "selected": true,
//           "e4xpenseRatio": 0.25
//         },
//         {
//           "name": "Max",
//           "selected": true,
//           "e4xpenseRatio": 0.25
//         },
//         {
//           "name": "Elyan",
//           "selected": true,
//           "e4xpenseRatio": 0.25
//         },
//         {
//           "name": "Suzie",
//           "selected": true,
//           "e4xpenseRatio": 0.25
//         }
//       ],
//       "createdAt": "2021-11-12T01:15:18.485Z",
//       "createdBy": "a",
//       "updatedAt": "2021-11-13T16:27:17.320Z",
//       "updatedBy": "a"
//     },
//     {
//       "id": 7,
//       "tripId": 13,
//       "name": "Boissons",
//       "amount": 8,
//       "date": "2021-11-12T01:15:30.053Z",
//       "payer": "Max",
//       "payees": [
//         {
//           "name": "Dju",
//           "selected": true,
//           "e4xpenseRatio": 0.25
//         },
//         {
//           "name": "Max",
//           "selected": true,
//           "e4xpenseRatio": 0.25
//         },
//         {
//           "name": "Elyan",
//           "selected": true,
//           "e4xpenseRatio": 0.25
//         },
//         {
//           "name": "Suzie",
//           "selected": true,
//           "e4xpenseRatio": 0.25
//         }
//       ],
//       "createdAt": "2021-11-12T01:15:43.803Z",
//       "createdBy": "a",
//       "updatedAt": "2021-11-13T16:27:17.320Z",
//       "updatedBy": "a"
//     },
//     {
//       "id": 8,
//       "tripId": 13,
//       "name": "Courses crepes",
//       "amount": 73,
//       "date": "2021-11-12T01:15:56.935Z",
//       "payer": "Suzie",
//       "payees": [
//         {
//           "name": "Max",
//           "selected": true,
//           "e4xpenseRatio": 0.3333333333333333
//         },
//         {
//           "name": "Elyan",
//           "selected": true,
//           "e4xpenseRatio": 0.3333333333333333
//         },
//         {
//           "name": "Suzie",
//           "selected": true,
//           "e4xpenseRatio": 0.3333333333333333
//         }
//       ],
//       "createdAt": "2021-11-12T01:16:18.211Z",
//       "createdBy": "a",
//       "updatedAt": "2021-11-13T16:27:17.320Z",
//       "updatedBy": "a"
//     },
//     {
//       "id": 9,
//       "tripId": 13,
//       "name": "Courses appart",
//       "amount": 32,
//       "date": "2021-11-12T01:16:28.439Z",
//       "payer": "Suzie",
//       "payees": [
//         {
//           "name": "Max",
//           "selected": true,
//           "e4xpenseRatio": 0.5
//         },
//         {
//           "name": "Suzie",
//           "selected": true,
//           "e4xpenseRatio": 0.5
//         }
//       ],
//       "createdAt": "2021-11-12T01:16:52.705Z",
//       "createdBy": "a",
//       "updatedAt": "2021-11-13T16:27:17.320Z",
//       "updatedBy": "a"
//     },
//     {
//       "id": 10,
//       "tripId": 13,
//       "name": "Rembours Max",
//       "amount": 46.03,
//       "date": "2021-11-12T01:29:09.236Z",
//       "payer": "Max",
//       "payees": [
//         {
//           "name": "Suzie",
//           "selected": true,
//           "e4xpenseRatio": 1
//         }
//       ],
//       "createdAt": "2021-11-12T01:29:38.078Z",
//       "createdBy": "a",
//       "updatedAt": "2021-11-13T16:27:17.320Z",
//       "updatedBy": "a"
//     },
//     {
//       "id": 11,
//       "tripId": 13,
//       "name": "Rembours Elyan",
//       "amount": 34.23,
//       "date": "2021-11-12T01:29:39.971Z",
//       "payer": "Elyan",
//       "payees": [
//         {
//           "name": "Suzie",
//           "selected": true,
//           "e4xpenseRatio": 1
//         }
//       ],
//       "createdAt": "2021-11-12T01:30:08.709Z",
//       "createdBy": "a",
//       "updatedAt": "2021-11-13T16:27:17.320Z",
//       "updatedBy": "a"
//     }
//   ].map(e => ExpenseModel.fromJson(e));
// }
//
// function getExpenses1(): ExpenseModel[] {
//   const all = getExpenses();
//   all.push(ExpenseModel.fromJson(    {
//     "id": 9,
//     "tripId": 2,
//     "name": "trajet",
//     "amount": 300,
//     "date": "2021-10-31T17:58:07.836Z",
//     "payer": "Cams",
//     "payees": [
//       {"name": "Dju", "e4xpenseRatio": 0.333333333},
//       {"name": "Cams", "e4xpenseRatio": 0.333333333},
//       {"name": "Alx", "e4xpenseRatio": 0.333333333}
//     ],
//     "createdAt": "2021-10-31T17:58:46.016Z",
//     "createdBy": "",
//     "updatedAt": "2021-10-31T17:58:46.016Z",
//     "updatedBy": ""
//   }))
//
//   return all;
// }
//
// function getExpenses2(): ExpenseModel[] {
//   const all = getExpenses1();
//   all.push(ExpenseModel.fromJson(    {
//     "id": 10,
//     "tripId": 2,
//     "name": "trajet",
//     "amount": 90,
//     "date": "2021-10-31T17:58:07.836Z",
//     "payer": "Alx",
//     "payees": [
//       {"name": "Dju", "e4xpenseRatio": 0.333333333},
//       {"name": "Cams", "e4xpenseRatio": 0.333333333},
//       {"name": "Alx", "e4xpenseRatio": 0.333333333}
//     ],
//     "createdAt": "2021-10-31T17:58:46.016Z",
//     "createdBy": "",
//     "updatedAt": "2021-10-31T17:58:46.016Z",
//     "updatedBy": ""
//   }))
//
//   return all;
// }
//
// function getExpenses3(): ExpenseModel[] {
//   const all = getExpenses2();
//   all.push(ExpenseModel.fromJson(    {
//     "id": 11,
//     "tripId": 2,
//     "name": "courses",
//     "amount": 220,
//     "date": "2021-10-31T17:58:07.836Z",
//     "payer": "Cams",
//     "payees": [
//       {"name": "Dju", "e4xpenseRatio": 0.333333333},
//       {"name": "Cams", "e4xpenseRatio": 0.333333333},
//       {"name": "Alx", "e4xpenseRatio": 0.333333333}
//     ],
//     "createdAt": "2021-10-31T17:58:46.016Z",
//     "createdBy": "",
//     "updatedAt": "2021-10-31T17:58:46.016Z",
//     "updatedBy": ""
//   }))
//
//   return all;
// }

function getExpensesBug(): ExpenseModel[] {
  const all: ExpenseModel[] = [
    {
      amount: 9,
      payer: "alx",
      payees: [
        ExpenseParticipantModel.from({name: "dju", e4xpenseRatio: 1}),
        ExpenseParticipantModel.from({name: "cam", e4xpenseRatio: 1}),
        ExpenseParticipantModel.from({name: "maxk", e4xpenseRatio: 1})
      ]
    } as ExpenseModel,
    {
      amount: 22,
      payer: "alx",
      payees: [
        ExpenseParticipantModel.from({name: "dju", e4xpenseRatio: 1}),
        ExpenseParticipantModel.from({name: "maxk", e4xpenseRatio: 1})
      ]
    } as ExpenseModel,
    {
      amount: 57 * 2,
      payer: "dju",
      payees: [
        ExpenseParticipantModel.from({name: "cam", e4xpenseRatio: 1}),
        ExpenseParticipantModel.from({name: "maxk", e4xpenseRatio: 1})
      ]
    } as ExpenseModel,
    {
      amount: 42,
      payer: "cam",
      payees: [
        ExpenseParticipantModel.from({name: "dju", e4xpenseRatio: 1}),
        ExpenseParticipantModel.from({name: "maxk", e4xpenseRatio: 1})
      ]
    } as ExpenseModel
  ];
  return all;
}

// function checkArray(allDeps: any[], expected: any[]) {
//   allDeps.forEach(d => {
//     d.amount = Math.round(d.amount * 100) / 100;
//   });
//
//   expect(allDeps.length).toEqual(expected.length);
//   for(let dep of allDeps) {
//     expect(
//       expected.some(e => dep.person === e.person && dep.owesTo === e.owesTo && dep.amount === e.amount)
//       // expected.some(e => dep.person === e.person && dep.owesTo === e.owesTo && Math.abs(dep.amount - e.amount) > 0.1)
//     ).toEqual(true);
//   }
// }

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

    checkArray(component.allDeps, expected);
  });

  it('should load repartition properly 2', () => {
    expect(component).toBeTruthy();

    component.expenses = getExpenses2();
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

    checkArray(component.allDeps, expected);
  });

  it('should load repartition properly BUG', () => {
    // // FIXME
    // expect(component).toBeTruthy();
    //
    // component.expenses = getExpensesBug();
    // fixture.detectChanges();
    //
    // const expected: any[] = [
    //   {
    //     "person": "maxk",
    //     "owesTo": "alx",
    //     "amount": 13
    //   },
    //   {
    //     "person": "cam",
    //     "owesTo": "alx",
    //     "amount": 18
    //   },
    //   {
    //     "person": "maxk",
    //     "owesTo": "dju",
    //     "amount": 79
    //   }
    // ];
    //
    // debugger;
    // checkArray(component.allDeps, expected);
  });

  // it('should load Marseille repartition from csv', () => {
  //   expect(component).toBeTruthy();
  //
  //   component.expenses = getExpenses3();
  //   fixture.detectChanges();
  //
  //   const expected: any[] = [
  //     {
  //       "person": "Alx",
  //       "owesTo": "Cams",
  //       "amount": 193.33
  //     },
  //     {
  //       "person": "Dju",
  //       "owesTo": "Cams",
  //       "amount": 23.33
  //     }
  //   ];
  //
  //   checkArray(component.allDeps, expected);
  // });

  it('should handle A -> C, C -> B, B -> A (int values)', () => {
    expect(component).toBeTruthy();

    // component.expenses = getExpensesACCBBA();
    // fixture.detectChanges();

    const expected: IRepartitionItem[] = [];
    const start: IRepartitionItem[] =   [
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

    checkArray(res, expected);
  });

  it('should handle A -> C, C -> B, B -> A (float values)', () => {
    expect(component).toBeTruthy();

    // component.expenses = getExpensesACCBBA();
    // fixture.detectChanges();

    const expected: IRepartitionItem[] = [];
    const start: IRepartitionItem[] =   [
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

    checkArray(res, expected);
  });

  it('should handle A -> C, C -> B, B -> A (int values, not 1)', () => {
    expect(component).toBeTruthy();

    // component.expenses = getExpensesACCBBA();
    // fixture.detectChanges();

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
    const start: IRepartitionItem[] =   [
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

    checkArray(res, expected);
  });

  it('should handle A -> C, A -> B, C -> A (int values, not 1)', () => {
    expect(component).toBeTruthy();

    // component.expenses = getExpensesACCBBA();
    // fixture.detectChanges();

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
    const start: IRepartitionItem[] =   [
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

    checkArray(res, expected);
  });

  it('should get spent properly', () => {
    expect(component).toBeTruthy();

    component.expenses = getExpensesMarseille().slice(0, 2);
    fixture.detectChanges();

    const target = fixture.debugElement.nativeElement.querySelector("#spendWrapper .container");
    const content = target.textContent;

    expect(content).toEqual("Dju10.700.00 /jMax10.700.00 /jElyan10.700.00 /jSuzie10.700.00 /j");
  });

  // it('should handle A -> C, A -> B, C -> Av (all values)', () => {
  //   expect(component).toBeTruthy();
  //
  //   // component.expenses = getExpensesACCBBA();
  //   // fixture.detectChanges();
  //
  //   const expected: IRepartitionItem[] = [
  //     {
  //       "person": "aissa ",
  //       "owesTo": "alx",
  //       "amount": 15.477777777777778
  //     },
  //     {
  //       "person": "annecha",
  //       "owesTo": "alx",
  //       "amount": 15.477777777777778
  //     },
  //     {
  //       "person": "jeffmile",
  //       "owesTo": "alx",
  //       "amount": 15.477777777777778
  //     },
  //     {
  //       "person": "leslie",
  //       "owesTo": "alx",
  //       "amount": 30.955555555555556
  //     },
  //     {
  //       "person": "maxk",
  //       "owesTo": "alx",
  //       "amount": 34.64
  //     },
  //     {
  //       "person": "sekou",
  //       "owesTo": "alx",
  //       "amount": 15.477777777777778
  //     },
  //     {
  //       "person": "mymy",
  //       "owesTo": "alx",
  //       "amount": 15.477777777777778
  //     },
  //     {
  //       "person": "cam",
  //       "owesTo": "dju ",
  //       "amount": 19.855555555555558
  //     },
  //     {
  //       "person": "leslie",
  //       "owesTo": "dju ",
  //       "amount": 41.522222222222226
  //     },
  //     {
  //       "person": "maxk",
  //       "owesTo": "cam",
  //       "amount": 2.49
  //     }
  //   ];
  //   const start: IRepartitionItem[] =   [{"person":"aissa ","owesTo":"alx","amount":15.477777777777778},{"person":"annecha","owesTo":"alx","amount":15.477777777777778},{"person":"cam","owesTo":"alx","amount":19.177777777777777},{"person":"jeffmile","owesTo":"alx","amount":15.477777777777778},{"person":"leslie","owesTo":"alx","amount":30.955555555555556},{"person":"maxk","owesTo":"alx","amount":30.955555555555556},{"person":"sekou","owesTo":"alx","amount":15.477777777777778},{"person":"mymy","owesTo":"alx","amount":15.477777777777778},{"person":"cam","owesTo":"dju ","amount":19.855555555555558},{"person":"leslie","owesTo":"dju ","amount":41.522222222222226}];
  //   debugger;
  //   const res = component["handleRepartition"](start);
  //
  //   debugger;
  //   checkArray(res, expected);
  // });
});
