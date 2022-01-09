import {TravelModel} from "./travel-model";
import {BaseItem} from "./baseItem";
import {Participant} from "./participants";

export class Travel extends BaseItem {
  static from(model: TravelModel): Travel {
    const t = new Travel();
    t.id = model.id;
    t.name = model.name
    t.description = model.description;
    t.participants = model.participants?.map(p => Participant.from(p));
    t.fromDate = model.fromDate;
    t.toDate = model.toDate;

    return t;
  }

  constructor() {
    super("travel");
  }

  participants?: Participant[];
  name: string = "";
  description: string = "";
  id: number = -1;
  fromDate: Date | null = null;
  toDate: Date | null = null;


  toString(): string {
    return `[${this.id}] ${this.name} ${this.description}`;
  }

  static fromJson(o: any): Travel {
    const t: Travel = new Travel();
    Object.assign(t, o);
    return t;
  }
}
