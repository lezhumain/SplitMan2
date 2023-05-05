import { Injectable } from '@angular/core';
import {InviteDate, UserModel} from "./models/user-model";
import {BehaviorSubject, mergeMap, Observable, of} from "rxjs";
import {User} from "./models/user";
import {catchError, distinctUntilChanged, filter, first, map, take, tap} from "rxjs/operators";
import {BaseService} from "./base-service.service";
import {Travel} from "./models/travel";
import {environment} from "../environments/environment";
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

  public _connectedUser: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);

  private _connectedUserID: number = -1;
  get connectedUserID(): number {
    return this._connectedUserID;
  }

  constructor(http: HttpClient, private readonly _apiService: ApiService) {
    super(http);
    // const sessionIDName = localStorage.getItem("")

    const data = this.getSessionData();
    console.log("[UserServiceService] sessionData: %o", data);
    const dataNumber = data !== null ? Number(data) : -1;
    this._connectedUserID = isNaN(dataNumber) || dataNumber < -1 ? -1 : dataNumber;
    console.log("[UserServiceService] connectedUserID: %o", this._connectedUserID);

    if(this._connectedUserID === -1) {
      // this._connectedUser.next(null);
      this._updateConnectedUser(null);
    }
    else {
        BaseService.USER_ID_INIT = Number(data);
        this.getUsers().pipe(
          filter(u => u.length > 0),
          first(),
          map(all => {
            const r = all.find(a => a.id === Number(data));
            return r;
          })
        ).subscribe((u: User | undefined) => {
          console.log("[UserServiceService] init user: %o", u);
          this._updateConnectedUser(u);
        });
    }

    // if(data !== null && data !== undefined && Number(data) > -1) {
    //   BaseService.USER_ID_INIT = Number(data);
    //   this.getUsers().pipe(
    //     filter(u => u.length > 0),
    //     first(),
    //     map(all => {
    //       const r = all.find(a => a.id === Number(data));
    //       return r;
    //     })
    //   ).subscribe((u: User | undefined) => {
    //     this._updateConnectedUser(u || null);
    //   });
    // }
    //
    // this._connectedUser
    //   .pipe(
    //     distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    //     // filter(u => !u || (!!u && u.id >= 0))
    //   )
    //   .subscribe((u: User | null) => {
    //     BaseService.USER_ID = u ? u.id : null;
    //   });
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

  public getUsers(force = false): Observable<User[]> {
    return this._apiService.getAllByType<User>("user", force).pipe(
      map((o: User[]) => {
        return o.map((oo: User) => User.fromJson(oo));
      })
    );
  }

  addOrUpdateUser(model: UserModel, isUpdate = false, isRegister = false): Observable<any> {
    const data: User = User.from(model);

    const shouldNotGetLastID = isUpdate || isRegister;
    console.log("shouldNotGetLastID: " + shouldNotGetLastID);

    const newID$ = of(data?.id || -2);

    return newID$.pipe(
      mergeMap((lastID: number) => {
        data.id = isRegister ? -2 : lastID;
        return this._apiService.updateItem(data, isRegister);
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

  getUserByPass(username: string, pass: string, isLogin = false): Observable<UserModel | null> {
    // return this.getUserByNameAndPass(username, pass).pipe(
    return this._apiService.httpPost(environment.api + "/login", {password: pass, username: username}, "json", "application/json", false, "body").pipe(
      map((u: User | IAPIResult) => {
        // if(u && isLogin) {
        //   this._updateConnectedUser(u);
        // }
        // debugger;
        // return !!u && u.hasOwnProperty("email") ? u as UserModel : null;

        const hasErrorProp = u && u.hasOwnProperty("hasError");

        const userRes = !!u && u.hasOwnProperty("email") ? User.fromJson(u).toModel() : null;

        if(hasErrorProp || !userRes) {
          console.warn("Maybe login error");
          console.warn(u);
          return null;
        }

        return userRes;
      }),
      mergeMap((u: UserModel | null) => {
        if(!u) {
          return of(u);
        }
        return this.setConnectedUserByObj(u, !isLogin, isLogin);
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
    //     this._updateConnectedUser(u);
    //   }
    // );

    return this.getUserByNameAndPass(username, password).pipe(
      mergeMap((u: User | null) => {
        this._updateConnectedUser(u);

        return this._connectedUser.pipe(
          filter(cu => {
            return cu === u;
          }),
          first()
        ) as Observable<User>;
      })
    );
  }

  setConnectedUserByObj(user: UserModel | User, reconcileWithDb = false, setSeesion = false): Observable<UserModel> {
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
    //   this._updateConnectedUser(uu);
    // });



    // obs$.subscribe((uu: User | null) => {
    //   if(setSeesion) {
    //     this.setSessionData(uu);
    //   }
    //   this._updateConnectedUser(uu);
    // });
    return obs$.pipe(
      mergeMap((uu: User | null) => {
        if(setSeesion) {
          this.setSessionData(uu);
        }
        this._updateConnectedUser(uu);

        return this._connectedUser.pipe(
          filter(t => {
            return t !== null && JSON.stringify(t) === JSON.stringify(uu);
          }),
          first(),
          map((u) => {
            const res = u?.toModel() || null;
            // if (!res) {
            //   this._apiService.resetData();
            // }
            return res as UserModel;
          })
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
    //   mergeMap((uu: User | null) => {
    //     this._updateConnectedUser(uu);
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
        console.log("invite  response: ");
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
      mergeMap(([user, currentUser]: [UserModel | null, User | null]) => {
        const userM: User | null = user ? User.from(user) : (currentUser || null);
        console.log("userM: %o", userM);
        // if(user && userM !== currentUser) {
        // if(currentUser && user && userM?.equals(currentUser)) {

        // if(user && JSON.stringify(userM) !== JSON.stringify(currentUser) && !!currentUser?._id && !!userM?._id && !!currentUser?._rev && !!userM?._rev
        //     && Number(currentUser?._rev.split("_")[0]) < Number(userM?._rev.split("_")[0])) {

        const mongoID = user?._id || currentUser?._id;
        console.log("mongoid: %o", mongoID);
        if(!!mongoID && !!userM && !userM._id) {
          userM._id = mongoID;
        }
        if(!!mongoID && !!currentUser && !currentUser._id) {
          currentUser._id = mongoID;
        }

        if(!!userM && User.isValid(userM) && !!user) {
          if(currentUser === null || currentUser.revNumber < userM.revNumber) {
            console.log("Should change user to: %o", userM);
            this._updateConnectedUser(userM);

            return this._connectedUser.pipe(
              filter((u: User | null) => (u === null) || (u !== null && !!u._id && !!u._rev)),
              first(),
              map((u: User | null) => u ? u.toModel() : null)
            )
          }
        }

        // if(userM && !!currentUser?._id && !!userM?._id && !!currentUser?._rev && !!userM?._rev
        //     && Number(currentUser?._rev.split("_")[0]) < Number(userM?._rev.split("_")[0])) {
        //   console.log("Should change user to: %o", userM);
        //   this._updateConnectedUser(userM);
        //
        //   return this._connectedUser.pipe(
        //     first(),
        //     map((u: User | null) => u ? u.toModel() : null)
        //   )
        // }

        return of(currentUser?.toModel() || null);
      }),
      distinctUntilChanged((prev, curr) => prev?._rev === curr?._rev),
      // filter(r => !!r?._id && !!r?._rev),
      tap((u) => console.warn("got user: %o", u))
    );
  }

  addTravelToConnectedUser(travel: Travel): Observable<null> {

    // const connectedUser = this._connectedUser.getValue();
    return this._connectedUser.pipe(
      filter(c => c == null || !!c._id),
      first(),
      mergeMap((connectedUser: User | null) => {
        if(connectedUser == null) {
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
          //   this._updateConnectedUser(connectedUser);
          // })
          mergeMap(() => {
            // this._updateConnectedUser(connectedUser);
            return this.setConnectedUserByObj(connectedUser);
          }),
          map(() => null)
        );
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
      mergeMap((u: User | null) => {
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
            tap(() => this._updateConnectedUser(u))
          );
        }

        return obs$;
      }),
      mergeMap(() => {
        return this._apiService.getAll(true).pipe(
          map((all) => {
            const us = this._connectedUser.getValue();
            if(us) {
              const newUs = all.find(a => a.type === "user" && a.id === us.id);
              const theUs = newUs ? User.fromJson(newUs) : null;
              this._updateConnectedUser(theUs);
            }

            return null;
          })
        );
      })
    );
  }

  logOut(): Observable<null> {
    return this._apiService.httpGet(environment.api + "/logout").pipe(
      take(1),
      mergeMap(() => {
        BaseService.USER_ID_INIT = null;
        this._updateConnectedUser(null);
        this.setSessionData(null);
        return this._connectedUser.pipe(
          filter(r => r === null),
          first()
        ) as Observable<null>;
        // return this.setConnected(null)
      })
    );
  }

  private _updateConnectedUser(userParam: any) {
    const currentUser = this._connectedUser.getValue();
    if(!!currentUser?._id && !!userParam && !userParam._id) {
      userParam._id = currentUser?._id;
    }
    console.log("[UserServiceService] updating connected user: %o", userParam);
    this._connectedUser.next(userParam);
  }
}
