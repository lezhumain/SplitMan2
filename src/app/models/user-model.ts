export interface InviteDate {
  tripName?: string;
  isAccepted: boolean;
  tripID: number;
  nameInTrip?: string;
}

export class UserModel {
  id: number = -1;
  email: string = "";
  username: string = "";
  password: string = "";
  password1: string = "";
  invites: InviteDate[] = [];

  toString(): string {
    return `${this.email} ${this.username} ${this.password} ${this.password1}`;
  }
}
