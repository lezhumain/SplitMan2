import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {BehaviorSubject, combineLatest, Observable, of} from "rxjs";
import {BaseItem} from "./models/baseItem";
import {catchError, debounceTime, filter, first, map, tap} from "rxjs/operators";
import {flatMap} from "rxjs/internal/operators";
import {environment} from "../environments/environment";

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
    const headers: any = this._headers;

    return this.http.get<any>(url, {withCredentials: true}).pipe(
      // map(userResponse => console.log('users: ', userResponse)),
      map((userResponse: any) => {
        // debugger;
        return userResponse;
      }),
      catchError(error => {
        console.log('error: ', error);
        return of(null);
      })
    );
  }

  httpPost(url: string, data: any | string | FormData, respType: "json" | "text" | "blob" | "arraybuffer" = "json",
                     accept = 'application/json', withCred = true, obs: "body" | "response" = "body",
                    addHeaders?: {[key: string]: string}): Observable<any> {

    // const headers: any = this._headers;

    if(typeof data === 'object' && !(data instanceof FormData)) {
      data = JSON.stringify(data);
    }

    let headers = addHeaders || {};
    headers["Accept"] = accept;

    return this.http.post(url, data, {withCredentials: withCred, responseType: respType as "json" | undefined,
      // headers : new HttpHeaders({ /*'Content-Type': 'application/json', */'Accept': accept }), observe: obs as "body" | undefined})
        headers : new HttpHeaders(headers), observe: obs as "body" | undefined})
      .pipe(
        map(userResponse => {
          console.log('http post result: ', userResponse);
          return userResponse;
        }),
        catchError(error => {
          console.warn('http post error: ', error);
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

  saveInDb(obj: any): Observable<null> {
    return this.httpPost(environment.api + "/saveOne", obj).pipe(
      flatMap(() => {
        const currentAll = this._allItems$.getValue() || [];
        const currentAllStr = JSON.stringify(currentAll);
        const newValues = currentAll.slice();

        const targetIndex = newValues.findIndex(t => t.id === obj.id && t.type === obj.type);
        if(targetIndex === -1) {
          newValues.push(obj);
        }
        else if(targetIndex > -1) {
          newValues.splice(targetIndex, 1, obj);
        }
        this._allItems$.next(newValues);

        return this._allItems$.pipe(
          tap((e) => console.log("savedb 0: %o", e)),
          // filter(t => JSON.stringify(t) !== currentAllStr),
          filter(t => !!t && t.includes(obj)),
          tap((e) => console.log("savedb 1: %o", e)),
          first(),
          map(() => null)
        )
      })
    );
  }

  updateItem(model: any): Observable<any> {
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

    return this.saveInDb(model);
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
}
