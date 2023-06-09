import {ExpenseModel} from "../app/models/expense-model";
import {getExpenses} from "../app/models/expense-model.spec";
import {ExpenseParticipantModel} from "../app/models/expenseParticipants";

export function getExpensesMarseille(): ExpenseModel[] {
  return [
    {
      "id": 2,
      "tripId": 13,
      "name": "Autoroute",
      "amount": 14.8,
      "date": "2021-11-12T01:12:32.454Z",
      "payer": "Suzie",
      "payees": [
        {
          "name": "Dju",
          "selected": true,
          "e4xpenseRatio": 0.25
        },
        {
          "name": "Max",
          "selected": true,
          "e4xpenseRatio": 0.25
        },
        {
          "name": "Elyan",
          "selected": true,
          "e4xpenseRatio": 0.25
        },
        {
          "name": "Suzie",
          "selected": true,
          "e4xpenseRatio": 0.25
        }
      ],
      "createdAt": "2021-11-12T01:12:54.842Z",
      "createdBy": "a",
      "updatedAt": "2021-11-13T16:27:17.320Z",
      "updatedBy": "a"
    },
    {
      "id": 3,
      "tripId": 13,
      "name": "Essence",
      "amount": 28,
      "date": "2021-11-12T01:12:56.459Z",
      "payer": "Suzie",
      "payees": [
        {
          "name": "Dju",
          "selected": true,
          "e4xpenseRatio": 0.25
        },
        {
          "name": "Max",
          "selected": true,
          "e4xpenseRatio": 0.25
        },
        {
          "name": "Elyan",
          "selected": true,
          "e4xpenseRatio": 0.25
        },
        {
          "name": "Suzie",
          "selected": true,
          "e4xpenseRatio": 0.25
        }
      ],
      "createdAt": "2021-11-12T01:13:16.809Z",
      "createdBy": "a",
      "updatedAt": "2021-11-13T16:27:17.320Z",
      "updatedBy": "a"
    },
    {
      "id": 4,
      "tripId": 13,
      "name": "Glace",
      "amount": 14,
      "date": "2021-11-12T01:14:04.454Z",
      "payer": "Dju",
      "payees": [
        {
          "name": "Dju",
          "selected": true,
          "e4xpenseRatio": 0.25
        },
        {
          "name": "Max",
          "selected": true,
          "e4xpenseRatio": 0.25
        },
        {
          "name": "Elyan",
          "selected": true,
          "e4xpenseRatio": 0.25
        },
        {
          "name": "Suzie",
          "selected": true,
          "e4xpenseRatio": 0.25
        }
      ],
      "createdAt": "2021-11-12T01:14:17.565Z",
      "createdBy": "a",
      "updatedAt": "2021-11-13T16:27:17.320Z",
      "updatedBy": "a"
    },
    {
      "id": 5,
      "tripId": 13,
      "name": "Tacos",
      "amount": 27,
      "date": "2021-11-12T01:14:28.582Z",
      "payer": "Max",
      "payees": [
        {
          "name": "Dju",
          "selected": true,
          "e4xpenseRatio": 0.5
        },
        {
          "name": "Max",
          "selected": true,
          "e4xpenseRatio": 0.5
        }
      ],
      "createdAt": "2021-11-12T01:14:52.103Z",
      "createdBy": "a",
      "updatedAt": "2021-11-13T16:27:17.320Z",
      "updatedBy": "a"
    },
    {
      "id": 6,
      "tripId": 13,
      "name": "Pizza",
      "amount": 44,
      "date": "2021-11-12T01:15:04.094Z",
      "payer": "Dju",
      "payees": [
        {
          "name": "Dju",
          "selected": true,
          "e4xpenseRatio": 0.25
        },
        {
          "name": "Max",
          "selected": true,
          "e4xpenseRatio": 0.25
        },
        {
          "name": "Elyan",
          "selected": true,
          "e4xpenseRatio": 0.25
        },
        {
          "name": "Suzie",
          "selected": true,
          "e4xpenseRatio": 0.25
        }
      ],
      "createdAt": "2021-11-12T01:15:18.485Z",
      "createdBy": "a",
      "updatedAt": "2021-11-13T16:27:17.320Z",
      "updatedBy": "a"
    },
    {
      "id": 7,
      "tripId": 13,
      "name": "Boissons",
      "amount": 8,
      "date": "2021-11-12T01:15:30.053Z",
      "payer": "Max",
      "payees": [
        {
          "name": "Dju",
          "selected": true,
          "e4xpenseRatio": 0.25
        },
        {
          "name": "Max",
          "selected": true,
          "e4xpenseRatio": 0.25
        },
        {
          "name": "Elyan",
          "selected": true,
          "e4xpenseRatio": 0.25
        },
        {
          "name": "Suzie",
          "selected": true,
          "e4xpenseRatio": 0.25
        }
      ],
      "createdAt": "2021-11-12T01:15:43.803Z",
      "createdBy": "a",
      "updatedAt": "2021-11-13T16:27:17.320Z",
      "updatedBy": "a"
    },
    {
      "id": 8,
      "tripId": 13,
      "name": "Courses crepes",
      "amount": 73,
      "date": "2021-11-12T01:15:56.935Z",
      "payer": "Suzie",
      "payees": [
        {
          "name": "Max",
          "selected": true,
          "e4xpenseRatio": 0.3333333333333333
        },
        {
          "name": "Elyan",
          "selected": true,
          "e4xpenseRatio": 0.3333333333333333
        },
        {
          "name": "Suzie",
          "selected": true,
          "e4xpenseRatio": 0.3333333333333333
        }
      ],
      "createdAt": "2021-11-12T01:16:18.211Z",
      "createdBy": "a",
      "updatedAt": "2021-11-13T16:27:17.320Z",
      "updatedBy": "a"
    },
    {
      "id": 9,
      "tripId": 13,
      "name": "Courses appart",
      "amount": 32,
      "date": "2021-11-12T01:16:28.439Z",
      "payer": "Suzie",
      "payees": [
        {
          "name": "Max",
          "selected": true,
          "e4xpenseRatio": 0.5
        },
        {
          "name": "Suzie",
          "selected": true,
          "e4xpenseRatio": 0.5
        }
      ],
      "createdAt": "2021-11-12T01:16:52.705Z",
      "createdBy": "a",
      "updatedAt": "2021-11-13T16:27:17.320Z",
      "updatedBy": "a"
    },
    {
      "id": 10,
      "tripId": 13,
      "name": "Rembours Max",
      "amount": 46.03,
      "date": "2021-11-12T01:29:09.236Z",
      "payer": "Max",
      "payees": [
        {
          "name": "Suzie",
          "selected": true,
          "e4xpenseRatio": 1
        }
      ],
      "createdAt": "2021-11-12T01:29:38.078Z",
      "createdBy": "a",
      "updatedAt": "2021-11-13T16:27:17.320Z",
      "updatedBy": "a"
    },
    {
      "id": 11,
      "tripId": 13,
      "name": "Rembours Elyan",
      "amount": 34.23,
      "date": "2021-11-12T01:29:39.971Z",
      "payer": "Elyan",
      "payees": [
        {
          "name": "Suzie",
          "selected": true,
          "e4xpenseRatio": 1
        }
      ],
      "createdAt": "2021-11-12T01:30:08.709Z",
      "createdBy": "a",
      "updatedAt": "2021-11-13T16:27:17.320Z",
      "updatedBy": "a"
    }
  ].map(e => ExpenseModel.fromJson(e));
}

export function getExpenses1(): ExpenseModel[] {
  const all = getExpenses();
  all.push(ExpenseModel.fromJson(    {
    "id": 9,
    "tripId": 2,
    "name": "trajet",
    "amount": 300,
    "date": "2021-10-31T17:58:07.836Z",
    "payer": "Cams",
    "payees": [
      {"name": "Dju", "e4xpenseRatio": 0.333333333},
      {"name": "Cams", "e4xpenseRatio": 0.333333333},
      {"name": "Alx", "e4xpenseRatio": 0.333333333}
    ],
    "createdAt": "2021-10-31T17:58:46.016Z",
    "createdBy": "",
    "updatedAt": "2021-10-31T17:58:46.016Z",
    "updatedBy": ""
  }))

  return all;
}

export function getExpenses2(): ExpenseModel[] {
  const all = getExpenses1();
  all.push(ExpenseModel.fromJson(    {
    "id": 10,
    "tripId": 2,
    "name": "trajet",
    "amount": 90,
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
  }))

  return all;
}

export function getExpenses3(): ExpenseModel[] {
  const all = getExpenses2();
  all.push(ExpenseModel.fromJson(    {
    "id": 11,
    "tripId": 2,
    "name": "courses",
    "amount": 220,
    "date": "2021-10-31T17:58:07.836Z",
    "payer": "Cams",
    "payees": [
      {"name": "Dju", "e4xpenseRatio": 0.333333333},
      {"name": "Cams", "e4xpenseRatio": 0.333333333},
      {"name": "Alx", "e4xpenseRatio": 0.333333333}
    ],
    "createdAt": "2021-10-31T17:58:46.016Z",
    "createdBy": "",
    "updatedAt": "2021-10-31T17:58:46.016Z",
    "updatedBy": ""
  }))

  return all;
}

export function getExpensesBug(): ExpenseModel[] {
  const all: ExpenseModel[] = [
    {
      amount: 9,
      payer: "alx",
      payees: [
        ExpenseParticipantModel.from({name: "dju", e4xpenseRatio: 1/3}),
        ExpenseParticipantModel.from({name: "cam", e4xpenseRatio: 1/3}),
        ExpenseParticipantModel.from({name: "maxk", e4xpenseRatio: 1/3})
      ]
    } as ExpenseModel,
    {
      amount: 22,
      payer: "alx",
      payees: [
        ExpenseParticipantModel.from({name: "dju", e4xpenseRatio: 1/2}),
        ExpenseParticipantModel.from({name: "maxk", e4xpenseRatio: 1/2})
      ]
    } as ExpenseModel,
    {
      amount: 57 * 2,
      payer: "dju",
      payees: [
        ExpenseParticipantModel.from({name: "cam", e4xpenseRatio: 1/2}),
        ExpenseParticipantModel.from({name: "maxk", e4xpenseRatio: 1/2})
      ]
    } as ExpenseModel,
    {
      amount: 42,
      payer: "cam",
      payees: [
        ExpenseParticipantModel.from({name: "dju", e4xpenseRatio: 1/2}),
        ExpenseParticipantModel.from({name: "maxk", e4xpenseRatio: 1/2})
      ]
    } as ExpenseModel
  ];
  return all;
}
