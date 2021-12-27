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

  toModel(): UserModel {
    const u: UserModel = new UserModel();
    u.username = this.username;
    u.email = this.email;
    u.password = this.password;
    u.invites = this.invites.slice();
    u.id = this.id;

    return u;
  }

  constructor() {
    super("user");
  }

  email: string = "";
  username: string = "";
  password: string = "";
  invites: InviteDate[] = [];


  toString(): string {
    return `${this.email} ${this.username} ${this.password}`;
  }

  static fromJson(o: any): User {
    const t: User = new User();
    Object.assign(t, o);
    return t;
  }
}
