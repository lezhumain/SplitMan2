import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {BehaviorSubject, from, Observable, of} from "rxjs";
import {BaseItem} from "./models/baseItem";
import {catchError, debounceTime, filter, first, map, tap} from "rxjs/operators";
import {flatMap} from "rxjs/internal/operators";
import {environment} from "../environments/environment";
import {ToastComponent} from "./toast/toast.component";
import {ToastType} from "./toast/toast.shared";

interface CordovaResponse {
  status: number;
  data: string;
  url: string;
  headers: {[key: string]: string}
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly _tableKey = "spliman_db";
  static readonly STORAGE_KEY = "splitman_userid";

  // private _allItems: BaseItem[] = [];
  private userID: number | null = null;

  constructor(private http: HttpClient) { }

  private _allItems$: BehaviorSubject<BaseItem[] | null> = new BehaviorSubject<BaseItem[] | null>(null);

  private readonly _headers: any = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // 'rxjs-custom-header': 'Rxjs'
  };

  httpGet(url: string): Observable<any> {
    // TODO find out why port is duplicated
    url = url.replace(/(\:\d+)+/, "$1");

    // @ts-ignore
    const hasCordova = !!window.cordova;

    const getObs$ = hasCordova
      ? this.cordovaGet(url).pipe(map((d: CordovaResponse) => {
        console.log(d.data);
        return JSON.parse(d.data);
      }))
      : this.regularGet(url, {withCredentials: true});

    return getObs$.pipe(
      // map(userResponse => console.log('users: ', userResponse)),
      map((userResponse: any) => {
        // debugger;
        return userResponse;
      }),
      catchError(error => {
        console.log('error: ', error);
        console.log(JSON.stringify(error, null, 2));
        return of(null);
      })
    );
  }

  httpPost(url: string, data: any | string | FormData, respType: "json" | "text" | "blob" | "arraybuffer" = "json",
                     accept = 'application/json', withCred = true, obs: "body" | "response" = "body",
                    addHeaders?: {[key: string]: string}): Observable<any> {

    // TODO find out why port is duplicated
    url = url.replace(/(\:\d+)+/, "$1")

    // const headers: any = this._headers;
    console.log("POST: " + url);

    const strData: string = typeof data === 'object' && !(data instanceof FormData)
      ? JSON.stringify(data)
      : data;

    let headers = addHeaders || {};
    headers["Accept"] = accept;

    // @ts-ignore
    const hasCordova = !!window.cordova;

    console.log("has cordova: " + hasCordova.toString())

    const postObs$ = hasCordova
      ? this.cordovaPost(url, data, withCred, respType, accept, obs).pipe(map((d: CordovaResponse) => {
        console.log("[cordovaPost] post response:")
        console.log(d.data);
        return !!d.data ? JSON.parse(d.data) : null;
      }))
      : this.regularPost(url, strData, withCred, respType, accept, obs);

    return postObs$
        // headers : new HttpHeaders(headers), observe: obs as "body" | undefined})
      .pipe(
        map(userResponse => {
          console.log('http post result: %o', userResponse);
          console.log(JSON.stringify(userResponse, null, 2));
          console.log(typeof(userResponse));
          return userResponse;
        }),
        catchError(error => {
          console.warn('http post error for : ' + url);
          console.warn(error);
          console.log(error);
          console.warn(JSON.stringify(error, null, 2));
          ToastComponent.toastdata$.next({type: ToastType.ERROR, message: error.message});
          return of(null);
        })
      );
  }

  getAll(force: boolean = false): Observable<BaseItem[]> {

    const res: BaseItem[] | null = this._allItems$.getValue();
    const fromCache = res !== null && !force;

    return (fromCache ? of(res) : this.pGetAll().pipe(first())).pipe(
      first(),
      flatMap((r: BaseItem[] | null) => {
        const nreR: BaseItem[] | null = r;

        if (!fromCache) {
          this._allItems$.next(nreR);
        }

        return <Observable<BaseItem[]>>this._allItems$.pipe(
          debounceTime(500),
          // filter(r => r === nreR),
          filter(r => r?.length === nreR?.length),
          first()
        );
      })
    );
  }

  private pGetAll(): Observable<BaseItem[]> {
    return this.httpGet(environment.api + "/get").pipe(
      //  of([{"id":2,"type":"user","email":"auto.splitman@wspt.co.uk","username":"Auto","password":"a","invites":[]}]).pipe(
      map((e: any) => {
        // if(!e) {
        //   return [];
        // }
        // e = BaseItem.fromJson(e);

        console.warn("\tpGetAll called !");

        const first = e ? e.map((ee: BaseItem) => BaseItem.fromJson(ee)) : [];
        const allItems = this.filterAll(first); // TODO do this server-side
        // BaseService._allItems = first; // TODO do this server-side

        return allItems;
      })
    );
  }

  getAllByType<T>(type: string, force = false): Observable<T[]> {
    return this.getAll(force).pipe(
      map((r: BaseItem[]) => {
        return <any[]>r.filter(rr => rr.hasOwnProperty("type") && rr["type"] === type) as T[];
      })
    );
  }

  saveInDb(obj: any, isRegister = false): Observable<null> {
    return this.httpPost(environment.api + (isRegister ? "/register" : "/saveOne"), obj,"json", "application/json", !isRegister).pipe(
      flatMap((fullObj: any) => {
        const currentAll = this._allItems$.getValue() || [];
        const currentAllStr = JSON.stringify(currentAll);
        const newValues = currentAll.slice();

        const targetIndex = newValues.findIndex(t => t.id === obj.id && t.type === obj.type);
        if(!isRegister) {
          obj._rev = fullObj._rev;
        }
        if(targetIndex === -1) {
          console.log("No target index, inserting");
          if(!isRegister) {
            if (obj["_id"] === undefined) {
              obj["_id"] = fullObj._id;
            }
            if (!obj.id) {
              obj.id = fullObj.id;
            }

            newValues.push(obj);
          }
        }
        else if(targetIndex > -1) {
          // if (obj["_id"] === undefined) {
          //   obj["_id"] = autoID;
          // }
          console.log("Updated obj: %o", obj);
          newValues.splice(targetIndex, 1, obj);
        }
        this._allItems$.next(newValues);

        return this._allItems$.pipe(
          tap((e) => console.log("savedb 0: %o", e)),
          // filter(t => JSON.stringify(t) !== currentAllStr),
          filter((t: BaseItem[] | null) => {
            if(isRegister) {
              return true;
            }
            return !!t && Array.isArray(t) && t.length > 0 && (isRegister || t.includes(obj))
              && t.find(tobj => JSON.stringify(tobj._id) === JSON.stringify(obj._id)) !== undefined
              && t.find(tobj => tobj._rev === obj._rev) !== undefined;
          }),
          tap((e) => console.log("savedb 1: %o", e)),
          first(),
          map(() => null)
        )
      })
    );
  }

  updateItem(model: any, isRegister = false): Observable<any> {
    // TODO refactor with add
    // return this.getAll().pipe(
    //   flatMap((existing: BaseItem[]) => {
    //     // const existing: User[] = JSON.parse(localStorage.getItem(this._tableKey) || "[]");
    //     // const data = new User(model);
    //
    //     // existing = existing.map(e => {
    //     //   e = BaseItem.fromJson(e);
    //     //   return e;
    //     // });
    //
    //     const exIndex = existing.findIndex(e => e.equalsTypeAndID(model));
    //     if(exIndex > -1) {
    //       existing.splice(exIndex, 1, model);
    //     }
    //     else {
    //       existing.push(model);
    //     }
    //     // const str = JSON.stringify(existing);
    //     // localStorage.setItem(this._tableKey, str);
    //
    //     return this.saveInDb(existing);
    //   })
    // );

    model["updating"] = true;
    return this.saveInDb(model, isRegister);
  }

  // addOrUpdateUser(model: UserModel): Observable<any> {
  //   return this.getUsers().pipe(
  //     map((existing: User[]) => {
  //       // const existing: User[] = JSON.parse(localStorage.getItem(this._tableKey) || "[]");
  //       const data = new User(model);
  //       if(!existing.find(e => e.equals(data))) {
  //         existing.push(data);
  //       }
  //       const str = JSON.stringify(existing);
  //       localStorage.setItem(this._tableKey, str);
  //
  //       return;
  //     })
  //   );
  // }
  //
  // checkUserPass(username: string, pass: string): Observable<boolean> {
  //   return this.getUsers().pipe(
  //     map((users: User[]) => {
  //       return users.some(u => u.username === username && u.password === pass)
  //     })
  //   );
  // }
  private filterAll(all: BaseItem[]): BaseItem[] {
    const userLocalStor = localStorage.getItem(ApiService.STORAGE_KEY) || this.userID;
    const userID: number | null = userLocalStor === null ? null : Number(userLocalStor);

    if (!window.location.href.includes("/login")) {
      if ((userID === null || isNaN(userID) || userID < 0)) {
        return [];
      }

      // TODO login server side

      const user: any = all.find(a => a.type === "user" && a.id === userID);
      if (!user) {
        return [];
      }

      // TODO filter other items
      // all = all.filter(a => ;
      // all = all.filter(a => );

      const indexesToRemove: number[] = all.reduce((res: number[], a: any, index: number) => {
        if ((a.type === "travel"
            && (!user.invites || !user.invites.some((ui: any) => ui.tripID === a.id)))
          || a.type === "expense"
          && (!user.invites || !user.invites.some((ui: any) => ui.tripID === a.tripId))) {
          res.push(index);
        }

        return res;
      }, []);

      // for (const ind of indexesToRemove) {
      //   all.splice(ind, 1);
      // }
      const newArr = all.filter((_: any, index: number) => !indexesToRemove.includes(index));
      // debugger;
      all = newArr.slice()
    }

    return all;
  }

  resetData() {
    this._allItems$.next(null);
  }

  private cordovaPost(url: string, data: any, withCred: boolean, respType: string,
                      accept: string, obs: string): Observable<CordovaResponse> {
    this.initCordovaHTTP();
    console.log("[cordovaPost] post data:");
    console.log(JSON.stringify(data, null, 2));
    return from(new Promise<any>((resolve, reject) => {
      // @ts-ignore
      window.cordova.plugin.http.post(url, data, {
        'Content-Type': 'application/json',
        Accept: accept
      }, function(response: CordovaResponse) {
        resolve(response);
      }, function(response: any) {
        reject(response);
      });
    }));
  }

  private regularPost(url: string, data: string, withCred: boolean, respType: string,
                      accept: string, obs: string): Observable<any> {
    return this.http.post(url, data, {withCredentials: withCred, responseType: respType as "json" | undefined,
      headers : new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': accept }), observe: obs as "body" | undefined})
  }

  private initCordovaHTTP() {
    console.log("initCordovaHTTP");
    // @ts-ignore
    const windowCordova = window.cordova;

    if (!windowCordova || !windowCordova.plugin) {
      return;
    }

    windowCordova.plugin.http.setDataSerializer('json');
    for(const key in this._headers) {
      windowCordova.plugin.http.setHeader('splitman2.fr', key, this._headers[key]);
    }
  }

  private regularGet(url: string, options: any) {
    return this.http.get<any>(url, options);
  }

  private cordovaGet(url: string): Observable<CordovaResponse> {
    this.initCordovaHTTP();
    return from(new Promise<any>((resolve, reject) => {
      // @ts-ignore
      window.cordova.plugin.http.get(url, {}, {}, function(response: CordovaResponse) {
        resolve(response);
      }, function(response: any) {
        reject(response);
      });
    }));
  }
}
