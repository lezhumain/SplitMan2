import {Travel} from "./travel";
import {Participant, ParticipantModel} from "./participants";
import {IMongoID} from "./imongoid";

export class TravelModel {
  static fromTravel(t: Travel): TravelModel {
    const m = new TravelModel();
    m._id = t._id;
    m._rev = t._rev;
    m.id = t.id;
    m.name = t.name;
    m.description = t.description;
    m.participants = t.participants?.map(p => ParticipantModel.from(p));
    m.fromDate = t.fromDate;
    m.toDate = t.toDate;

    return m;
  }

  constructor() {
  }

  participants?: ParticipantModel[];
  name: string = "";
  description: string = "";
  id: number = -1;
  _id?: String | IMongoID;
  _rev?: String;
  fromDate: Date | null = null;
  toDate: Date | null = null;

  toString(): string {
    return `[${this.id}] ${this.name} ${this.description}`;
  }
}
