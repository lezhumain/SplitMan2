export class ExpenseParticipantModel {
  name = "";
  e4xpenseRatio?: number;
  selected: boolean = false;

  static from(participantModel: ExpenseParticipant): ExpenseParticipantModel {
    const p = new ExpenseParticipantModel();
    Object.assign(p, participantModel);

    return p;
  }

  toString(): string {
    return `${this.name} (${this.e4xpenseRatio?.toFixed(2)}%)`;
  }
}

export class ExpenseParticipant {
  name = "";
  e4xpenseRatio?: number;

  static from(participantModel: ExpenseParticipantModel): ExpenseParticipant {
    const p = new ExpenseParticipant();
    Object.assign(p, participantModel);

    return p;
  }
}
