import { Injectable } from '@angular/core';
import {InviteDate, UserModel} from "./models/user-model";
import {BehaviorSubject, Observable, of} from "rxjs";
import {User} from "./models/user";
import {distinctUntilChanged, filter, first, map, take, tap} from "rxjs/operators";
import {BaseService} from "./base-service.service";
import {Travel} from "./models/travel";
import {flatMap} from "rxjs/internal/operators";
import {TravelModel} from "./models/travel-model";
import {environment} from "../environments/environment";
import {AjaxResponse} from "rxjs/ajax";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class UserServiceService extends BaseService {
  // get connectedUser(): User | null {
  //   return this._connectedUser;
  // }
  //
  // set connectedUser(value: User | null) {
  //   this._connectedUser = value;
  // }
  // private _connectedUser: User | null = null;

  private readonly key = "splitman_userid";
  private _connectedUser: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);

  constructor(http: HttpClient) {
    super(http);
    // const sessionIDName = localStorage.getItem("")

    const data = this.getSessionData();
    if(data !== null && data !== undefined && Number(data) > -1) {
      this.getUsers().pipe(
        filter(u => u.length > 0),
        first(),
        map(all => {
          const r = all.find(a => a.id === Number(data));
          return r;
        })
      ).subscribe((u: User | undefined) => {
        this._connectedUser.next(u || null);
      });
    }

    this._connectedUser
      .pipe(
        filter(u => !u || (!!u && u.id >= 0))
      )
      .subscribe((u: User | null) => {
        this.setSessionData();
        BaseService.USER_ID = u ? u.id : null;
      });
  }

  private setSessionData(): void {
    const u = this._connectedUser.getValue();
    if(u) {
      const id = u.id.toString();
      console.log("Stored userID " + id);
      localStorage.setItem(this.key, id);
    }
    else {
      localStorage.removeItem(this.key);
    }
  }

  private getSessionData(): string | null {
    const userID = localStorage.getItem(this.key);
    return userID;
  }

  private getUsers(): Observable<User[]> {
    return this.getAllByType<User>("user").pipe(
      map((o: User[]) => {
        return o.map((oo: User) => User.fromJson(oo));
      })
    );
  }

  addOrUpdateUser(model: UserModel, isUpdate = false): Observable<any> {
    const data: User = User.from(model);
    const newID$ = isUpdate ? of(data.id) : this.getLastID().pipe(map(id => id + 1));

    return newID$.pipe(
      flatMap((lastID: number) => {
        data.id = lastID;
        return this.updateItem(data);
      })
    );
  }

  getUserByNameAndPass(username: string, pass: string): Observable<User | null> {
    return this.getUsers().pipe(
      map((users: User[]) => {
        return users.find(u => u.username === username && u.password === pass) || null;
      })
    );
  }

  getUserByPass(username: string, pass: string, isLogin = true): Observable<UserModel | null> {
    // return this.getUserByNameAndPass(username, pass).pipe(
    return this.httpPost(environment.api + "/login", {password: pass, username: username}).pipe(
      map((u: User) => {
        // if(u && isLogin) {
        //   this._connectedUser.next(u);
        // }
        // debugger;
        // return !!u && u.hasOwnProperty("email") ? u as UserModel : null;
        return !!u && u.hasOwnProperty("email") ? User.fromJson(u).toModel() : null;
      })
    );
  }

  getConnectedUsername(): string {
    const u: User | null = this._connectedUser.getValue();
    // return  of(u ? u.username : "");
    return  u ? u.username : "";
  }

  setConnectedUser(username: string, password: string) {
    this.getUserByNameAndPass(username, password).subscribe(
      (u: User | null) => {
        this._connectedUser.next(u);
      }
    );
  }

  setConnectedUserByObj(user: UserModel, reconcileWithDb = false) {
    // debugger;
    // this.getUserByNameAndPass(username, password).subscribe(
    //   (u: User | null) => {
    // debugger;
    const u = User.from(user);

    const obs$ = reconcileWithDb ? this.getUserByEmail(u.email) : of(u);

    obs$.subscribe((uu: User | null) => {
      this._connectedUser.next(uu);
    });
    //   }
    // );
  }

  sendInvite(travelID: number | null, email: string): Observable<boolean> {
    if(!travelID) {
      return of(false);
    }

    return this.httpPost(environment.api + "/invite", {tripID: travelID, email: email}).pipe(
      map(e => true)
    );

    // return this.getUserByEmail(email).pipe(
    //   flatMap((user: User| null ) => {
    //     if(!user) {
    //       return of(false);
    //     }
    //
    //     const inviteDate = {
    //       tripID: travelID,
    //       isAccepted: false
    //     };
    //
    //     if (!user.invites) {
    //       user.invites = [inviteDate];
    //     }
    //     else if(!user.invites.some(i => i.tripID === travelID)) {
    //       user.invites.push(inviteDate);
    //     }
    //
    //     return this.addOrUpdateItem(user).pipe(
    //       map(() => true)
    //     );
    //   })
    // );
  }

  public getUserByEmail(email: string): Observable<User | null> {
    return this.getUsers().pipe(
      map((users: User[]) => {
        return users.find(u => u.email === email) || null;
      })
    );
  }

  public getUserByID(id: number): Observable<UserModel | null> {
    return this.getUsers().pipe(
      map((users: User[]) => {
        const target = users.find(u => u.id === id);
        return target ? target.toModel() : null;
      })
    );
  }

  getConnectedUser(): Observable<UserModel | null> {
    // return of(this._connectedUser?.toModel() || null);
    return this._connectedUser.pipe(
      distinctUntilChanged(),
      map((u: User | null) => u ? u.toModel() : null)
    );
  }

  addTravelToConnectedUser(travel: Travel): Observable<null> {

    const connectedUser = this._connectedUser.getValue();
    if(!connectedUser) {
      console.error("No user connected");
      return of(null);
    }

    const gr: InviteDate = {
      tripID: travel.id,
      isAccepted: true
    }

    // debugger;

    // this._connectedUser.invites.push(gr);
    if (connectedUser.invites) {
      connectedUser.invites.push(gr);
    }
    return this.updateItem(connectedUser).pipe(
      tap(() => {
        this._connectedUser.next(connectedUser);
      })
    );
  }

  private getLastID(): Observable<number> {
    return this.getUsers().pipe(
      map((u: User[]) => {
        if(!u || u.length === 0) {
          return 0;
        }
        return Math.max(...u.map(uu => uu.id));
      })
    );
  }

  updateUserInvite(invite: InviteDate, userlID: number, isDelete = false): Observable<null> {
    const cu = this._connectedUser.getValue();
    // const userObs$ = cu ? of(cu) : this.getUserByID(userlID);
    const userObs$ = of(cu);

    return userObs$.pipe(
      flatMap((u: User | null) => {
        if(!u) {
          return of(null);
        }

        const inviteIndex = u.invites ? u.invites.findIndex(fi => fi.tripName === invite.tripName
          && fi.tripID === invite.tripID) : -1;
        if(inviteIndex > -1) {
          if (!isDelete) {
            u.invites.splice(inviteIndex, 1, invite);
          }
          else {
            u.invites.splice(inviteIndex, 1);
          }
        }

        let obs$ = this.updateItem(u);
        if(cu?.id === userlID) {
          obs$ = obs$.pipe(
            tap(() => this._connectedUser.next(u))
          );
        }

        return obs$;
      }),
      flatMap(() => {
        return this.getAll(true).pipe(
          map((all) => {
            const us = this._connectedUser.getValue();
            if(us) {
              const newUs = all.find(a => a.type === "user" && a.id === us.id);
              const theUs = newUs ? User.fromJson(newUs) : null;
              this._connectedUser.next(theUs);
            }

            return null;
          })
        );
      })
    );
  }

  logOut() {
    return this.httpGet(environment.api + "/logout").pipe(
      take(1),
      flatMap(() => {
        this._connectedUser.next(null);
        return this._connectedUser.pipe(
          first()
        );
      })
    );
  }
}
