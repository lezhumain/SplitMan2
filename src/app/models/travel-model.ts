import {Travel} from "./travel";
import {Participant} from "./participants";

export class TravelModel {
  static fromTravel(t: Travel): TravelModel {
    const m = new TravelModel();
    m.id = t.id;
    m.name = t.name;
    m.description = t.description;
    m.participants = t.participants?.slice();
    m.fromDate = t.fromDate;
    m.toDate = t.toDate;

    return m;
  }

  constructor() {
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
}
