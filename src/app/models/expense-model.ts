import {Expense} from "./expense";
import {ExpenseParticipantModel} from "./expenseParticipants";
import {Utils} from "../utilities/utils";
import {IMongoID} from "./imongoid";
import {takeWhile} from "rxjs/operators";

export class ExpenseModel {
  _id?: String | IMongoID;
  _rev?: String;
  id: number = -1;
  tripId: number = -1;
  name: string = "";
  amount: number = 0;
  isRemboursement: boolean = false;
  get amountStr(): string {
    return this.amount === 0 ? "" : this.amount.toString();
  };
  set amountStr(v: string) {
    this.amount = v === "" ? 0 : Number(v);
  };
  date: Date | null = new Date();
  payer: string = ""; // TODO list ?
  payees: ExpenseParticipantModel[] = [];
  createdAt: Date | string | null  = null;
  createdBy: string = "";
  updatedAt: Date | string | null  = null;
  updatedBy: string = "";
  categorie?: string;

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
    m._id = t._id;
    m._rev = t._rev;
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
    m.categorie = t.categorie;
    m.isRemboursement = t.isRemboursement;

    return m;
  }

  static fromJson(t: any): ExpenseModel {
    const m = new ExpenseModel();
    m.assignFromObj(t);

    return m;
  }

  private static dateFromISO(isoStr: string | Date | null): Date | null {
    return isoStr instanceof Date ? isoStr : (typeof(isoStr) === "string" ? new Date(isoStr.replace("Z", "")) : null)
  }

  toCSV(): string {
    const thisObj: any = Object.assign({}, this);

    let aaaaa = [];
    for(let i = 0; i < this.payees.length; ++i) {
      const objs: any[] = Object.keys(thisObj).map(k => {
        if (!thisObj.hasOwnProperty(k)) {
          return "";
        }
        const val = k !== "payees"
          ? (Utils.isDate(thisObj[k]) ? thisObj[k].toISOString() : thisObj[k].toString())
          : `${this.payees[i].name}---${this.payees[i].e4xpenseRatio}`;

        return val.replace(/,/g, " ").replace(/---/g, ",");
      });

      const objsRes = objs.map(o => o.toString()).join(",");
      aaaaa.push(objsRes);
    }
    return aaaaa.join("\n");
  }

  static toCSV(all: ExpenseModel[]): string {
    const keys = (Object.keys(all[0]).join(",") + "\n").replace("payees", "payee,payeePerc");
    return keys + all.reduce((res: string, item) => {
      res += item.toCSV() + "\n";
      return res;
    }, "");
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

  static fromCSV(csv: string): ExpenseModel[] {
    const models: ExpenseModel[] = [];

    const allLines = csv.split("\n").filter(c => !!c);
    const keys = allLines[0].split(",");
    const lines = allLines.slice(1);

    while(lines.length > 0) {
      const line: string | undefined = lines.pop();
      const model = new ExpenseModel();
      const modelObj: any = {} as ExpenseModel;
      const values: string[] | undefined = line?.split(",");

      if (values) {
        values.forEach((value: string, index: number) => {
          const key: string = keys[index];
          if (model.hasOwnProperty(key)) {
            modelObj[key] = value;
          }
        });

        // TODO payees
        const otherLines: string[] | null = line ? lines.filter(l => l.startsWith(`${values[0]},${values[1]},${values[2]},${values[3]}`)) : null;
        if(!otherLines) {
          // TODO
          continue;
        }
        else {
          const indexes: number[] = otherLines.map(ol => lines.indexOf(ol));
          indexes.sort((a, b) => b - a); // desc

          for(const index of indexes) {
            if(index === -1) {
              continue;
            }
            lines.splice(index, 1);
          }
        }

        const aaaallll: string[] = [line].concat(otherLines).map((aLine) => {
          const bits = aLine?.split(/, */);

          if(bits === undefined) {
            // TODO
            return null;
          }

          const payee = bits[7];
          const perc = bits[8];
          const line = `${payee}:${perc}`;

          return line;
        }).filter(tt => tt !== null) as string[];

        const together = aaaallll.join("-");
        modelObj["payees"] = together;

        const key = modelObj.id + modelObj.tripId + modelObj.name + modelObj.amount;
        modelObj["key"] = key;

        model.assignFromObj(modelObj);
        // TODO dates + payees

        const existing = models.find(m => ((m as any)["key"] as string) === key);
        if(!existing) {
          models.push(model);
        }
        else {
          debugger;
        }
      }
    }

    models.forEach((item: any) => {
      delete item["key"];
    });

    return models;
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

  hasID(iid: string): boolean {
    return this._id === iid || (this._id as IMongoID)?.$oid === iid;
  }
}
