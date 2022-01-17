import { Injectable } from '@angular/core';
import {InviteDate, UserModel} from "./models/user-model";
import {BehaviorSubject, Observable, of} from "rxjs";
import {User} from "./models/user";
import {catchError, distinctUntilChanged, filter, first, map, take, tap} from "rxjs/operators";
import {BaseService} from "./base-service.service";
import {Travel} from "./models/travel";
import {flatMap} from "rxjs/internal/operators";
import {TravelModel} from "./models/travel-model";
import {environment} from "../environments/environment";
import {AjaxResponse} from "rxjs/ajax";
import {HttpClient, HttpResponse} from "@angular/common/http";
import {IAPIResult} from "./models/iapiresult";
import {combineLatest} from "rxjs";
import {ApiService} from "./api.service";

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

  private _connectedUser: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);

  constructor(http: HttpClient, private readonly _apiService: ApiService) {
    super(http);
    // const sessionIDName = localStorage.getItem("")

    const data = this.getSessionData();
    if(data !== null && data !== undefined && Number(data) > -1) {
      BaseService.USER_ID_INIT = Number(data);
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
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
        // filter(u => !u || (!!u && u.id >= 0))
      )
      .subscribe((u: User | null) => {
        BaseService.USER_ID = u ? u.id : null;
      });
  }

  private setSessionData(user?: User | null): void {
    const u = user === undefined
      ? this._connectedUser.getValue()
      : user;

    if(u) {
      const id = u.id.toString();
      console.log("Stored userID " + id);
      localStorage.setItem(ApiService.STORAGE_KEY, id);
    }
    else {
      localStorage.removeItem(ApiService.STORAGE_KEY);
    }
  }

  public getSessionData(): string | null {
    const userID = localStorage.getItem(ApiService.STORAGE_KEY);
    return userID;
  }

  private getUsers(force = false): Observable<User[]> {
    return this._apiService.getAllByType<User>("user", force).pipe(
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
        return this._apiService.updateItem(data);
      })
    );
  }

  getUserByNameAndPass(username?: string, pass?: string): Observable<User | null> {
    return this.getUsers().pipe(
      map((users: User[]) => {
        return users.find(u => u.username === username && u.password === pass) || null;
      })
    );
  }

  getUserByPass(username: string, pass: string, isLogin = true): Observable<UserModel | null> {
    // return this.getUserByNameAndPass(username, pass).pipe(
    return this._apiService.httpPost(environment.api + "/login", {password: pass, username: username}, "json", "application/json", true, "body").pipe(
      map((u: User | IAPIResult) => {
        // if(u && isLogin) {
        //   this._connectedUser.next(u);
        // }
        // debugger;
        // return !!u && u.hasOwnProperty("email") ? u as UserModel : null;

        const hasErrorProp = u && u.hasOwnProperty("hasError");

        if(hasErrorProp) {
          console.warn("Maybe login error");
          console.warn(u);
          return null;
        }

        return !!u && u.hasOwnProperty("email") ? User.fromJson(u).toModel() : null;
      }),
      flatMap((u: UserModel | null) => {
        if(!u) {
          return of(u);
        }
        return this.setConnectedUserByObj(u, true, true);
      }),
      tap(() => console.log("bloop"))
    );
  }

  getConnectedUsername(): string {
    const u: User | null = this._connectedUser.getValue();
    // return  of(u ? u.username : "");
    return  u ? u.username : "";
  }

  setConnectedUser(username?: string, password?: string): Observable<User> {
    // this.getUserByNameAndPass(username, password).subscribe(
    //   (u: User | null) => {
    //     this._connectedUser.next(u);
    //   }
    // );

    return this.getUserByNameAndPass(username, password).pipe(
      flatMap((u: User | null) => {
        this._connectedUser.next(u);

        return this._connectedUser.pipe(
          filter(cu => {
            return cu === u;
          }),
          first()
        ) as Observable<User>;
      })
    );
  }

  setConnectedUserByObj(user: UserModel | User, reconcileWithDb = false, setSeesion = false): Observable<UserModel | null> {
    // debugger;
    // this.getUserByNameAndPass(username, password).subscribe(
    //   (u: User | null) => {
    // debugger;
    const u = user instanceof UserModel ? User.from(user) : user;

    const obs$ = (reconcileWithDb ? this.getUserByEmail(u.email) : of(u)).pipe(
      map((uu: User | null) => {
        if (uu) {
          u.invites = uu?.invites.slice();
        }

        return u;
      })
    );

    // obs$.subscribe((uu: User | null) => {
    //   this.setSessionData();
    //   this._connectedUser.next(uu);
    // });



    // obs$.subscribe((uu: User | null) => {
    //   if(setSeesion) {
    //     this.setSessionData(uu);
    //   }
    //   this._connectedUser.next(uu);
    // });
    return obs$.pipe(
      flatMap((uu: User | null) => {
        if(setSeesion) {
          this.setSessionData(uu);
        }
        this._connectedUser.next(uu);

        return this._connectedUser.pipe(
          filter(t => {
            return JSON.stringify(t) === JSON.stringify(uu);
          }),
          first(),
          map(u => u?.toModel() || null)
        )
      })
    );



    //   }
    // );


    //
    // const u = User.from(user);
    //
    // let obs$ = (reconcileWithDb ? this.getUserByEmail(u.email) : of(u)).pipe(
    //   map((uu: User | null) => {
    //     if (uu) {
    //       u.invites = uu?.invites.slice();
    //     }
    //
    //     return u;
    //   }),
    //   flatMap((uu: User | null) => {
    //     this._connectedUser.next(uu);
    //
    //     return this._connectedUser.pipe(
    //       filter(o => o === uu),
    //       first()
    //     );
    //   })
    // );
    //
    // if(setSeesion) {
    //   obs$ = obs$.pipe(
    //     tap(() => {
    //       this.setSessionData();
    //     })
    //   );
    // }
    // obs$.subscribe((uu: User | null) => {
    //   console.log("Set connected user: " + uu);
    // });
  }

  sendInvite(travelID: number | null, email: string): Observable<boolean> {
    if(travelID === null) {
      console.error("No travelID specified.");
      return of(false);
    }

    return this._apiService.httpPost(environment.api + "/invite", {tripID: travelID, email: email},
      "json", "application/json", true, "response").pipe(
      map((e: HttpResponse<void>) => {
        console.log("invite response: ");
        console.log(e);
        const noError = /20\d/.test(e.status.toString());
        if(!noError) {
          console.error("/invite error 0: %o", e);
        }
        return !!e && noError;
      }),
      catchError((e) => {
        console.error("/invite error 1: %o", e);
        return of(e);
      })
    );
  }

  public getUserByEmail(email: string): Observable<User | null> {
    return this.getUsers().pipe(
      map((users: User[]) => {
        return users.find(u => u.email === email) || null;
      })
    );
  }

  public getUserByID(id: number, force = false): Observable<UserModel | null> {
    return this.getUsers(force).pipe(
      map((users: User[]) => {
        const target = users.find(u => u.id === id);
        return target ? target.toModel() : null;
      })
    );
  }

  getConnectedUser(forceWithID = -1): Observable<UserModel | null> {
    const pre$: Observable<UserModel | null> = !isNaN(forceWithID) && forceWithID > -1
      ? this.getUserByID(forceWithID, true)
      : of(null);

    return combineLatest([pre$, this._connectedUser]).pipe(
      // first(),
      flatMap(([user, currentUser]: [UserModel | null, User | null]) => {
        const userM: User | null = user ? User.from(user) : (currentUser || null);
        // if(user && userM !== currentUser) {
        // if(currentUser && user && userM?.equals(currentUser)) {
        if(user && JSON.stringify(userM) !== JSON.stringify(currentUser)) {
          console.log("Should change user to: %o", user);
          this._connectedUser.next(userM);

          return this._connectedUser.pipe(
            first(),
            map((u: User | null) => u ? u.toModel() : null)
          )
        }

        return of(currentUser?.toModel() || null);
      }),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
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
    return this._apiService.updateItem(connectedUser).pipe(
      // tap(() => {
      //   this._connectedUser.next(connectedUser);
      // })
      flatMap(() => {
        // this._connectedUser.next(connectedUser);
        return this.setConnectedUserByObj(connectedUser);
      }),
      map(() => null)
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

        let obs$ = this._apiService.updateItem(u);
        if(cu?.id === userlID) {
          obs$ = obs$.pipe(
            tap(() => this._connectedUser.next(u))
          );
        }

        return obs$;
      }),
      flatMap(() => {
        return this._apiService.getAll(true).pipe(
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
    return this._apiService.httpGet(environment.api + "/logout").pipe(
      take(1),
      flatMap(() => {
        BaseService.USER_ID_INIT = null;
        this._connectedUser.next(null);
        this.setSessionData(null);
        return this._connectedUser.pipe(
          filter(r => !r),
          first()
        );
      })
    );
  }
}
