import {getExpensesMarseille} from "../../test-data/getEzxpenses";
import {RepartitionUtils} from "../../test-data/test_utils";
import {ExpenseModel} from "../models/expense-model";
import {SplitwiseHelper, SplitwiseInputItem} from "./splitwiseHelper";
// import {checkBalance} from "../../../../node-splitwise-js/test_utils";
import {IRepartitionItem} from "../repartition/repartition.component";

function checkSplits(splits: [string, string, number][], splitsExpect: [string, string, number][]) {
  for(const [from, to, amout] of splitsExpect) {
    const targ = splits
      .find(([sfrom, sto, samout]) => sfrom === from && sto === to && samout === amout)
    if(!targ) {
      throw new Error("Doesn't match");
    }
  }
}

function checkInputs(inputs: SplitwiseInputItem[], inputsExpect: SplitwiseInputItem[]) {
  expect(inputs.length).toEqual(inputsExpect.length);
  for(const input of inputs) {
    const targ = inputsExpect.find(ie => ie.paidBy === input.paidBy);
    expect(targ).toBeTruthy();
    if(!targ) {
      continue;
    }

    for(const paidForKey of Object.keys(targ?.paidFor || {})) {
      const paidFor = targ?.paidFor[paidForKey];
      expect(paidFor).toBeTruthy();
      if(!paidFor) {
        continue;
      }

      expect(input.paidFor[paidForKey]).toEqual(paidFor);
    }
  }
}

function testInputs(inputs: SplitwiseInputItem[], splitsExpect: [string, string, number][]) {
  const splits = SplitwiseHelper["splitOnly"](inputs);
  checkSplits(splits, splitsExpect);
  // checkBalance(splits, inputs);
  return splits;
}
describe('SplitwiseHelperBase', () => {
  const mainInputsExpect: SplitwiseInputItem[] = [
    {
      "paidBy": "A",
      "paidFor": {
        "B": 14.26,
        "C": 14.26,
        "D": 14.26
      }
    },
    {
      "paidBy": "B",
      "paidFor": {
        "C": 7,
        "D": 7
      }
    }
  ];
  const splitsExpect0: [string, string, number][] = [
    [
      "C",
      "A",
      21.259999999999998
    ],
    [
      "D",
      "A",
      21.259999999999998
    ],
    [
      "B",
      "A",
      0.2599999999999998
    ]
  ]
  const expenses0: ExpenseModel[] = [
    {
      "amount": 14.26 * 3,
      "payer": "A",
      "payees": [
        {
          "name": "B",
          "selected": true,
          "e4xpenseRatio": 1 / 3
        },
        {
          "name": "C",
          "selected": true,
          "e4xpenseRatio": 1 / 3
        },
        {
          "name": "D",
          "selected": true,
          "e4xpenseRatio": 1 / 3
        }
      ]
    } as ExpenseModel,
    {
      "amount": 14,
      "payer": "B",
      "payees": [
        {
          "name": "C",
          "selected": true,
          "e4xpenseRatio": 0.5
        },
        {
          "name": "D",
          "selected": true,
          "e4xpenseRatio": 0.5
        }
      ]
    } as ExpenseModel
  ];
  const reduced0 = [
    {
      "person": "B",
      "owesTo": "A",
      "amount": 14.26
    },
    {
      "person": "C",
      "owesTo": "A",
      "amount": 14.26
    },
    {
      "person": "D",
      "owesTo": "A",
      "amount": 14.26
    },
    {
      "person": "C",
      "owesTo": "B",
      "amount": 7
    },
    {
      "person": "D",
      "owesTo": "B",
      "amount": 7
    }
  ];

  // works with with hardcoded
  beforeEach(() => {
  });

  it('split0 raw', () => {
    // equiv to should get Marseille repartition properly BUG

    const inputs: SplitwiseInputItem[] = mainInputsExpect;
    const splitsExpect: [string, string, number][] = splitsExpect0;

    // @ts-ignore
    testInputs(inputs, splitsExpect);
  });

  it('test all', () => {
    // equiv to should get Marseille repartition properly BUG
    const expenses: ExpenseModel[] = expenses0;
    const inputsExpect: SplitwiseInputItem[] = mainInputsExpect;

    const splitsExpect: [string, string, number][] = splitsExpect0;

    const expectgg = [
      {
        "person": "C",
        "owesTo": "A",
        "amount": 21.259999999999998
      },
      {
        "person": "D",
        "owesTo": "A",
        "amount": 21.259999999999998
      },
      {
        "person": "B",
        "owesTo": "A",
        "amount": 0.2599999999999998
      }
    ];

    const inputs = SplitwiseHelper["expenseToInput"](expenses);
    checkInputs(inputs, inputsExpect);

    const splits = testInputs(inputs, splitsExpect);
    const repart: IRepartitionItem[] = SplitwiseHelper.splitToRepartition(splits);
    RepartitionUtils.checkBalanceRepart(expenses, repart);
  });

  it('split0 helper', () => {
    // equiv to should get Marseille repartition properly BUG
    const expenses: ExpenseModel[] = expenses0;
    const splitsExpect: IRepartitionItem[] = [];

    // @ts-ignore
    const splits: IRepartitionItem[] = SplitwiseHelper.split(expenses);
    RepartitionUtils.checkBalanceRepart(expenses, splits);
  });

  it('test reduce', () => {
    // const exp = getExpensesMarseille();
    // const i = 3;
    // console.log("i: " + i);
    //
    // const expenses = exp.slice(0, Math.min(i, exp.length)); // FIXME remove slice
    const expenses = expenses0; // FIXME remove slice
    const rep0: IRepartitionItem[] = SplitwiseHelper.reduceExpenses(expenses);
    const epxwecrt: IRepartitionItem[] = reduced0.slice();
    expect(SplitwiseHelper.equalRepartition(rep0, epxwecrt)).toEqual(true);
  });

  it('should get expense0 repartition properly BUG HELPER', () => {
    // const exp = getExpensesMarseille();
    // const i = 3;
    // console.log("i: " + i);
    //
    // const expenses = exp.slice(0, Math.min(i, exp.length)); // FIXME remove slice
    const expenses = expenses0; // FIXME remove slice
    const rep0: IRepartitionItem[] = SplitwiseHelper.reduceExpenses(expenses);
    const allDeps = SplitwiseHelper.splitFromRepart(rep0);

    console.log("Expenses:");
    console.log(JSON.stringify(expenses, null, 2));
    console.log("Repart:");
    console.log(JSON.stringify(allDeps, null, 2));

    RepartitionUtils.checkBalanceRepart(expenses, allDeps);
  });

  it('should get marseille repartition properly BUG HELPER', () => {
    // const exp = getExpensesMarseille();
    // const i = 3;
    // console.log("i: " + i);
    //
    // const expenses = exp.slice(0, Math.min(i, exp.length)); // FIXME remove slice
    const expenses = getExpensesMarseille(); // FIXME remove slice
    // const rep0: IRepartitionItem[] = SplitwiseHelper.reduceExpenses(expenses);
    // const allDeps = SplitwiseHelper.splitFromRepart(rep0);
    const allDeps: IRepartitionItem[] = SplitwiseHelper.split(expenses);

    console.log("Expenses:");
    console.log(JSON.stringify(expenses, null, 2));
    console.log("Repart:");
    console.log(JSON.stringify(allDeps, null, 2));

    expect(allDeps.every(a => a.checked));
    RepartitionUtils.checkBalanceRepart(expenses, allDeps);
  });

  // it("splitwise", () => {
  //   const tot1 = 300 + 40 + 30;
  //   const tot2 = 50 + 100 + 200;
  //
  //   const expenses: ExpenseModel[] = [
  //     {
  //       payer: 'A',
  //       amount: tot1,
  //       payees: [
  //         ExpenseParticipantModel.from({
  //           name: "B",
  //           e4xpenseRatio: 300 / tot1
  //         }),
  //         ExpenseParticipantModel.from({
  //           name: "C",
  //           e4xpenseRatio: 40 / tot1
  //         }),
  //         ExpenseParticipantModel.from({
  //           name: "D",
  //           e4xpenseRatio: 30 / tot1
  //         })
  //       ]
  //     } as ExpenseModel,
  //     {
  //       payer: 'B',
  //       amount: tot2,
  //       payees: [
  //         ExpenseParticipantModel.from({
  //           name: "A",
  //           e4xpenseRatio: 50 / tot2
  //         }),
  //         ExpenseParticipantModel.from({
  //           name: "B",
  //           e4xpenseRatio: 100 / tot2
  //         }),
  //         ExpenseParticipantModel.from({
  //           name: "C",
  //           e4xpenseRatio: 200 / tot2
  //         })
  //       ]
  //     } as ExpenseModel
  //   ];
  //
  //   const allDeps = SplitwiseHelper.split(expenses);
  //   RepartitionUtils.doTheTest(expenses, allDeps);
  // });
});

// describe('SplitwiseHelper', () => {
//   beforeEach(() => {
//   });
//
//   it('split0 raw', () => {
//     // equiv to should get Marseille repartition properly BUG
//
//     const inputs: SplitwiseInputItem[] = [
//       {
//         "paidBy": "A",
//         "paidFor": {
//           "B": 14.26,
//           "C": 14.26,
//           "D": 14.26
//         }
//       },
//       {
//         "paidBy": "B",
//         "paidFor": {
//           "C": 7,
//           "D": 7
//         }
//       }
//     ];
//     const splitsExpect: [string, string, number][] = [
//       [
//         "C",
//         "A",
//         21.259999999999998
//       ],
//       [
//         "D",
//         "A",
//         21.259999999999998
//       ],
//       [
//         "B",
//         "A",
//         0.2599999999999998
//       ]
//     ];
//
//     // @ts-ignore
//     testInputs(inputs, splitsExpect);
//     debugger;
//   });
//
//   it('test all', () => {
//     // equiv to should get Marseille repartition properly BUG
//     const expenses: ExpenseModel[] = [
//       {
//         "amount": 14.26 * 3,
//         "payer": "A",
//         "payees": [
//           {
//             "name": "B",
//             "selected": true,
//             "e4xpenseRatio": 1 / 3
//           },
//           {
//             "name": "C",
//             "selected": true,
//             "e4xpenseRatio": 1 / 3
//           },
//           {
//             "name": "D",
//             "selected": true,
//             "e4xpenseRatio": 1 / 3
//           }
//         ]
//       } as ExpenseModel,
//       {
//         "amount": 14,
//         "payer": "B",
//         "payees": [
//           {
//             "name": "C",
//             "selected": true,
//             "e4xpenseRatio": 0.5
//           },
//           {
//             "name": "D",
//             "selected": true,
//             "e4xpenseRatio": 0.5
//           }
//         ]
//       } as ExpenseModel
//     ];
//     const inputsExpect: SplitwiseInputItem[] = [
//       {
//         "paidBy": "A",
//         "paidFor": {
//           "B": 14.26,
//           "C": 14.26,
//           "D": 14.26
//         }
//       },
//       {
//         "paidBy": "B",
//         "paidFor": {
//           "C": 7,
//           "D": 7
//         }
//       }
//     ];
//
//     const splitsExpect: [string, string, number][] = [
//       [
//         "C",
//         "A",
//         21.259999999999998
//       ],
//       [
//         "D",
//         "A",
//         21.259999999999998
//       ],
//       [
//         "B",
//         "A",
//         0.2599999999999998
//       ]
//     ];
//
//     const expectgg = [
//       {
//         "person": "C",
//         "owesTo": "A",
//         "amount": 21.259999999999998
//       },
//       {
//         "person": "D",
//         "owesTo": "A",
//         "amount": 21.259999999999998
//       },
//       {
//         "person": "B",
//         "owesTo": "A",
//         "amount": 0.2599999999999998
//       }
//     ];
//
//     const inputs = SplitwiseHelper["expenseToInput"](expenses);
//     checkInputs(inputs, inputsExpect);
//
//     const splits = testInputs(inputs, splitsExpect);
//     const repart: IRepartitionItem[] = SplitwiseHelper.splitToRepartition(splits);
//     RepartitionUtils.doTheTest(expenses, repart);
//     debugger;
//   });
//
//   it('split0 helper', () => {
//     // equiv to should get Marseille repartition properly BUG
//
//     const expenses: ExpenseModel[] = [
//       {
//         "amount": 14.26 * 3,
//         "payer": "Suzie",
//         "payees": [
//           {
//             "name": "Dju",
//             "selected": true,
//             "e4xpenseRatio": 1/3
//           },
//           {
//             "name": "Max",
//             "selected": true,
//             "e4xpenseRatio": 1/3
//           },
//           {
//             "name": "Elyan",
//             "selected": true,
//             "e4xpenseRatio": 1/3
//           }
//         ]
//       } as ExpenseModel,
//       {
//         "amount": 14,
//         "payer": "Dju",
//         "payees": [
//           {
//             "name": "Max",
//             "selected": true,
//             "e4xpenseRatio": 0.5
//           },
//           {
//             "name": "Elyan",
//             "selected": true,
//             "e4xpenseRatio": 0.5
//           }
//         ]
//       } as ExpenseModel
//     ];
//     const splitsExpect: IRepartitionItem[] = [];
//
//     // @ts-ignore
//     const splits: IRepartitionItem[] = SplitwiseHelper.split(expenses);
//     RepartitionUtils.doTheTest(expenses, splits);
//   });
// });
