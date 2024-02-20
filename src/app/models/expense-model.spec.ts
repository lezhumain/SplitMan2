import {ExpenseModel} from "../models/expense-model";

export function getExpenses(): ExpenseModel[] {
  return [
    {
      "id": 6,
      "tripId": 2,
      "name": "Campin",
      "amount": 300,
      "date": "2022-01-10T00:00:00.000Z",
      "payer": "Dju",
      "payees": [
        {"name": "Dju", "e4xpenseRatio": 0.333333333},
        {"name": "Cams", "e4xpenseRatio": 0.333333333},
        {"name": "Alx", "e4xpenseRatio": 0.333333333}
      ],
      "createdAt": "2021-10-31T17:31:29.665Z",
      "createdBy": "",
      "updatedAt": "2021-10-31T17:31:29.665Z",
      "updatedBy": ""
    },
    {
      "id": 7,
      "tripId": 2,
      "name": "Z",
      "amount": 20,
      "date": "2021-10-31T17:36:06.265Z",
      "payer": "Cams",
      "payees": [
        {"name": "Dju", "e4xpenseRatio": 0.5},
        {"name": "Cams", "e4xpenseRatio": 0.5}
      ],
      "createdAt": "2021-10-31T17:36:41.735Z",
      "createdBy": "",
      "updatedAt": "2021-10-31T17:36:41.735Z",
      "updatedBy": ""
    },
    {
      "id": 8,
      "tripId": 2,
      "name": "trajet",
      "amount": 30,
      "date": "2021-10-31T17:58:07.836Z",
      "payer": "Alx",
      "payees": [
        {"name": "Dju", "e4xpenseRatio": 0.333333333},
        {"name": "Cams", "e4xpenseRatio": 0.333333333},
        {"name": "Alx", "e4xpenseRatio": 0.333333333}
      ],
      "createdAt": "2021-10-31T17:58:46.016Z",
      "createdBy": "",
      "updatedAt": "2021-10-31T17:58:46.016Z",
      "updatedBy": ""
    }

    // {
    //   "amount": 300,
    //   "payer": "Dju",
    //   "payees": [
    //     {"name": "Dju", "e4xpenseRatio": 0.333333333},
    //     {"name": "Cams", "e4xpenseRatio": 0.333333333},
    //     {"name": "Alx", "e4xpenseRatio": 0.333333333}
    //   ]
    // },
    // {
    //   "amount": 20,
    //   "payer": "Cams",
    //   "payees": [
    //     {"name": "Dju", "e4xpenseRatio": 0.5},
    //     {"name": "Cams", "e4xpenseRatio": 0.5}
    //   ]
    // },
    // {
    //   "amount": 30,
    //   "payer": "Alx",
    //   "payees": [
    //     {"name": "Dju", "e4xpenseRatio": 0.333333333},
    //     {"name": "Cams", "e4xpenseRatio": 0.333333333},
    //     {"name": "Alx", "e4xpenseRatio": 0.333333333}
    //   ]
    // }
  ].map(e => ExpenseModel.fromJson(e));
}

describe('ExpenseModel', () => {
  let expenses: ExpenseModel[];
  let csv = "";

  function testCSV() {
    const expected0 = `id,tripId,name,amount,isRemboursement,date,payer,payees,createdAt,createdBy,updatedAt,updatedBy
6,2,Campin,300,false,2022-01-10T00:00:00.000Z,Dju,Dju:0.333333333-Cams:0.333333333-Alx:0.333333333,2021-10-31T17:31:29.665Z,,2021-10-31T17:31:29.665Z,
7,2,Z,20,false,2021-10-31T17:36:06.265Z,Cams,Dju:0.5-Cams:0.5,2021-10-31T17:36:41.735Z,,2021-10-31T17:36:41.735Z,
8,2,trajet,30,false,2021-10-31T17:58:07.836Z,Alx,Dju:0.333333333-Cams:0.333333333-Alx:0.333333333,2021-10-31T17:58:46.016Z,,2021-10-31T17:58:46.016Z,
`;
    const res = ExpenseModel.toCSV(expenses);
    expect(res).toEqual(expected0);

    csv = res;
  }

  beforeEach(() => {
    expenses = getExpenses();
  });

  it('should render single expense csv', () => {
    const expected0 = "6,2,Campin,300,false,2022-01-10T00:00:00.000Z,Dju,Dju:0.333333333-Cams:0.333333333-Alx:0.333333333,2021-10-31T17:31:29.665Z,,2021-10-31T17:31:29.665Z,";
    const res = expenses[0].toCSV();
    expect(res).toEqual(expected0);
  });

  it('should render proper csv for single expense', () => {
    const expected0 = `id,tripId,name,amount,isRemboursement,date,payer,payees,createdAt,createdBy,updatedAt,updatedBy
6,2,Campin,300,false,2022-01-10T00:00:00.000Z,Dju,Dju:0.333333333-Cams:0.333333333-Alx:0.333333333,2021-10-31T17:31:29.665Z,,2021-10-31T17:31:29.665Z,
`;
    const res = ExpenseModel.toCSV(expenses.slice(0, 1));
    expect(res).toEqual(expected0);
  });

  it('should render proper csv', () => {
    testCSV();
  });

  it('should load from csv properly', () => {
    const expected = getExpenses();
    const expected0 = expected.map(e => e.toCSV());

    if(!csv) {
      testCSV();
    }

    const res: ExpenseModel[] = ExpenseModel.fromCSV(csv);

    // expect(res).toEqual(expected);
    // expect(res.map(e => e.toCSV())).toEqual(expected0);

    expect(res.map(e => e.toCSV()).every(l => expected0.includes(l))).toBeTruthy();
  });
});
