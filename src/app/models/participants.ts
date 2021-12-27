export class ParticipantModel {
  name = "";
  dayCount = -1;
  ratio?: number;
  // e4xpenseRatio?: number;

  static from(participantModel: Participant): ParticipantModel {
    const p = new ParticipantModel();
    Object.assign(p, participantModel);

    return p;
  }
}

export class Participant {
  name = "";
  dayCount = -1;
  ratio?: number;

  static from(participantModel: ParticipantModel): Participant {
    const p = new Participant();
    const model = JSON.parse(JSON.stringify(participantModel));
    // delete model.e4xpenseRatio;

    Object.assign(p, model);

    return p;
  }
}
