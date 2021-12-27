import {BaseItem} from "./baseItem";
import {ExpenseModel} from "./expense-model";
import {ExpenseParticipant} from "./expenseParticipants";

export class Expense extends BaseItem {
  static from(model: ExpenseModel): Expense {
    const u: Expense = new Expense();
    u.date = model.date;
    u.amount = model.amount;
    u.payees = model.payees.slice();
    u.payer = model.payer;
    u.id = model.id;
    u.tripId = model.tripId;
    u.name = model.name;
    u.createdAt = model.createdAt;
    u.createdBy = model.createdBy;
    u.updatedAt = model.updatedAt;
    u.updatedBy = model.updatedBy;

    return u;
  }

  constructor() {
    super("expense");
  }

  tripId: number = -1;
  name: string = "";
  amount: number = -1;
  date: Date | string | null  = null;
  payer: string = ""; // TODO list ?
  payees: ExpenseParticipant[] = [];
  createdAt: Date | string | null  = null;
  createdBy: string = "";
  updatedAt: Date | string | null  = null;
  updatedBy: string = "";

  toString(): string {
    return `${this.name} ${this.amount} ${this.date} ${this.payer}`;
  }

  static fromJson(o: any): Expense {
    const t: Expense = new Expense();
    Object.assign(t, o);
    return t;
  }
}
