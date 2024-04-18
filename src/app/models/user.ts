import {InviteDate, UserModel} from "./user-model";
import {BaseItem} from "./baseItem";

export class User extends BaseItem {
  static from(model: UserModel): User {
    const u: User = new User();
    // u.username = model.username;
    // u.email = model.email;
    // u.password = model.password;
    // u.invites = model.invites.slice();
    // u.id = model.id;

    Object.assign(u, model);
    u.invites = u.invites.slice();

    return u;
  }

  static isValid(us: User | null): boolean {
    return !!us && !!us._rev && !!us._id && us.id > 0;
  }

  toModel(): UserModel {
    // TODO check why this is not using static ".from(..."
    const u: UserModel = new UserModel();
    u.username = this.username;
    u.email = this.email;
    u.password = this.password;
    u.invites = this.invites.slice();
    u.id = this.id;
    u._id = this._id;
    u._rev = this._rev;
    u.iban = this.iban;

    return u;
  }

  constructor() {
    super("user");
  }

  email: string = "";
  username: string = "";
  password: string = "";
  invites: InviteDate[] = [];
  iban?: string;


  toString(): string {
    return `${this.email} ${this.username} ${this.password}`;
  }

  get revNumber(): number {
    return !!this._rev
      ? Number(this._rev.split("_")[0])
      : 0;
  }

  static fromJson(o: any): User {
    const t: User = new User();
    Object.assign(t, o);
    return t;
  }
}
