import {Expense} from "./expense";
import {ExpenseParticipant, ExpenseParticipantModel} from "./expenseParticipants";
import {ParticipantModel} from "./participants";
import {Utils} from "../utilities/utils";

export class ExpenseModel {
  id: number = -1;
  tripId: number = -1;
  name: string = "";
  amount: number = -1;
  date: Date | null = new Date();
  payer: string = ""; // TODO list ?
  payees: ExpenseParticipantModel[] = [];
  createdAt: Date | string | null  = null;
  createdBy: string = "";
  updatedAt: Date | string | null  = null;
  updatedBy: string = "";

  get allPayees(): string {
    return this.payees.map(p => p.name).join(", ");
  }
  //
  // set allPayees(val: string) {
  //   this.payees = val.split(/, ?/);
  // }

  get displayDate(): string {
    return this.date ? this.date.toLocaleDateString() : "";
  }

  get dateStr(): string {
    // return this.date ? this.date.toLocaleDateString() : "";
    return this.date ? (isFinite(this.date.getTime()) ? this.date.toISOString().split("T")[0] : "") : "";
  }

  set dateStr(v: string) {
    const matches: string[] = /(\d{4})-(\d{2})-(\d{2})/.exec(v) || [];
    if(matches.length === 0) {
      console.error("Bad date format");
      return;
    }

    const [_, year, month, day] = Array.from(/(\d{4})-(\d{2})-(\d{2})/.exec(v) || []).map(a => Number(a));
    this.date = new Date(year, month, day);
  }

  toString(): string {
    return this.date === null
      ? ""
      : `${this.date.getFullYear()}-${this.date.getMonth()}-${this.date.getDay()}`;
  }

  static fromExpense(t: Expense): ExpenseModel {
    const m = new ExpenseModel();
    m.id = t.id;
    m.name = t.name;
    m.date = ExpenseModel.dateFromISO(t.date);
    m.amount = t.amount;
    m.payees = t.payees.map(e => ExpenseParticipantModel.from(e));
    m.payer = t.payer;
    m.tripId = t.tripId;
    m.createdAt = ExpenseModel.dateFromISO(t.createdAt);
    m.createdBy = t.createdBy;
    m.updatedAt = ExpenseModel.dateFromISO(t.updatedAt);
    m.updatedBy = t.updatedBy;

    return m;
  }

  static fromJson(t: any): ExpenseModel {
    const m = new ExpenseModel();
    // m.id = t.id;
    // m.name = t.name;
    // m.date = ExpenseModel.dateFromISO(t.date);
    // m.amount = t.amount;
    // m.payees = t.payees;
    // m.payer = t.payer;
    // m.tripId = t.tripId;
    // m.createdAt = ExpenseModel.dateFromISO(t.createdAt);
    // m.createdBy = t.createdBy;
    // m.updatedAt = ExpenseModel.dateFromISO(t.updatedAt);
    // m.updatedBy = t.updatedBy;


    m.assignFromObj(t);



    return m;
  }

  private static dateFromISO(isoStr: string | Date | null): Date | null {
    return isoStr instanceof Date ? isoStr : (typeof(isoStr) === "string" ? new Date(isoStr.replace("Z", "")) : null)
  }

  toCSV(): string {
    const thisObj: any = Object.assign({}, this);

    // delete thisObj.payees;

    const objs: any[] = Object.keys(thisObj).map(k => {
      if(!thisObj.hasOwnProperty(k)) {
        return "";
      }
      const val = k !== "payees"
        ? (Utils.isDate(thisObj[k]) ? thisObj[k].toISOString() : thisObj[k].toString())
        : this.payees.map(p => `${p.name}:${p.e4xpenseRatio}`).join("-");
      return val.replace(/,/g, " ");
    });

    return objs.map(o => o.toString()).join(",");
  }

  static toCSV(all: ExpenseModel[]): string {
    const keys = Object.keys(all[0]).join(",") + "\n";
    return keys + all.reduce((res: string, item) => {
      res += item.toCSV() + "\n";
      return res;
    }, "");
  }

  static fromCSV(csv: string): ExpenseModel[] {
    const models: ExpenseModel[] = [];

    const allLines = csv.split("\n").filter(c => !!c);
    const keys = allLines[0].split(",");
    const lines = allLines.slice(1);

    lines.forEach((line: string) => {
      const model = new ExpenseModel();
      const modelObj: any = {} as ExpenseModel;
      const values = line.split(",");
      values.forEach((value: string, index: number) => {
        const key: string = keys[index];
        if(model.hasOwnProperty(key)) {
          modelObj[key] = value;
        }
      });

      model.assignFromObj(modelObj);
      // TODO dates + payees

      models.push(model);
    });

    return models;
  }

  private assignFromObj(modelObj: any) {
    Object.assign(this, modelObj);

    this.date = new Date(modelObj.date);
    this.createdAt = new Date(modelObj.createdAt);
    this.updatedAt = new Date(modelObj.updatedAt);

    this.payees = this.initPayees(modelObj.payees);

    this.id = Number(modelObj.id);
    this.tripId = Number(modelObj.tripId);
    this.amount = Number(modelObj.amount);
  }

  private initPayees(payees: ExpenseParticipantModel[] | string): ExpenseParticipantModel[] {
    const pay = Array.isArray(payees)
      ? payees.map(p => {
          const pm = new ExpenseParticipantModel();
          pm.name = p.name;
          pm.e4xpenseRatio = p.e4xpenseRatio;
          pm.selected = !!pm.e4xpenseRatio;

          return pm;
      })
      : payees.split("-").map((p: string) => {
        const theV = p.split(":");
        const mod = new ExpenseParticipantModel();
        mod.name = theV[0];
        mod.e4xpenseRatio = Number(theV[1]);
        mod.selected = mod.e4xpenseRatio > 0;

        return mod;
      });

    return pay;
  }
}
