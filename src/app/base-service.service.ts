import {UserModel} from "./models/user-model";
import {Observable, of} from "rxjs";
import {User} from "./models/user";
import {catchError, map, tap} from "rxjs/operators";
import {BaseItem} from "./models/baseItem";
import {ajax, AjaxRequest} from "rxjs/ajax";
import {flatMap} from "rxjs/internal/operators";
import {UserServiceService} from "./user-service.service";
import {environment} from "../environments/environment";
import {badData} from "../../e2e/data/bugData";
import {AjaxObservable} from "rxjs/internal-compatibility";
import {HttpHeaders, HttpRequest} from "@angular/common/http";
import { HttpClient } from '@angular/common/http';

export class BaseService {
  private readonly _tableKey = "spliman_db";
  private static _allItems: BaseItem[] = [];
  private readonly _headers: any = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // 'rxjs-custom-header': 'Rxjs'
  };

  protected static USER_ID: number| null = null;

  constructor(private http: HttpClient) { }

  protected httpGet(url: string): Observable<any> {
    const headers: any = this._headers;

    if (BaseService.USER_ID !== null) {
      headers["User-ID"] = BaseService.USER_ID;
    }

    // let options = new RequestOptions({ headers: headers, withCredentials: true });

    // return ajax.getJSON(url, headers).pipe(
    // return this.http.get<any>(url, {responseType: "json", headers: headers, withCredentials: true}).pipe(
    return this.http.get<any>(url, {withCredentials: true}).pipe(
      // map(userResponse => console.log('users: ', userResponse)),
      map(userResponse => {
        // debugger;
        return userResponse;
      }),
      catchError(error => {
        console.log('error: ', error);
        return of(null);
      })
    );
  }

  protected httpPost(url: string, data: any): Observable<any> {
    const headers: any = this._headers;
    headers["User-ID"] = BaseService.USER_ID;

    if(typeof data === 'object') {
      data = JSON.stringify(data);
    }

    // return this.http.post(url, data, {withCredentials: true, headers: {"Accept": "application/json", "Content-Type": "application/json"}})
    return this.http.post(url, data, {withCredentials: true, responseType: "json",
      headers : new HttpHeaders({ /*'Content-Type': 'application/json', */'Accept': 'application/json' })})
    // return this.http.post(url, data, {withCredentials: true})
    // return ajax({
    //   url: url,
    //   method: 'POST',
    //   headers: headers,
    //   body: data
    // })
      .pipe(
      // map(userResponse => console.log('users: ', userResponse)),
      map(userResponse => {
        return userResponse;
      }),
      catchError(error => {
        console.log('error: ', error);
        return of(null);
      })
    );
  }

  protected getAll(force: boolean = false): Observable<BaseItem[]> {
    const allObs = !force && BaseService._allItems && BaseService._allItems.length > 0
      ? of(BaseService._allItems)
      // : of(badData).pipe(
      : this.httpGet(environment.api + "/get").pipe(
      //  of([{"id":2,"type":"user","email":"auto.splitman@wspt.co.uk","username":"Auto","password":"a","invites":[]}]).pipe(
        map((e: any) => {
          if(!e) {
            return [];
          }
          // e = BaseItem.fromJson(e);
          BaseService._allItems = e.map((ee: BaseItem) => BaseItem.fromJson(ee));

          return BaseService._allItems;
        })
      );

    return allObs.pipe(
      map(all => {
        // const userLocalStor = localStorage.getItem("splitman_userid");
        const userLocalStor = BaseService.USER_ID;
        const userID: number | null = userLocalStor === null ? null : Number(BaseService.USER_ID);
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
      })
    );
  }

  protected getAllByType<T>(type: string, force = false): Observable<T[]> {
    return this.getAll(force).pipe(
      map((r: BaseItem[]) => {
        return <any[]>r.filter(rr => rr.hasOwnProperty("type") && rr["type"] === type) as T[];
      })
    );
  }

  protected addOrUpdateItem(model: BaseItem, doSave: boolean = true): Observable<any> {
    return this.saveInDb(model);
    // return this.getAll().pipe(
    //   flatMap((existing: BaseItem[]) => {
    //     // const existing: User[] = JSON.parse(localStorage.getItem(this._tableKey) || "[]");
    //     // const data = new User(model);
    //     existing = existing.map(e => {
    //       e = BaseItem.fromJson(e);
    //       return e;
    //     })
    //
    //     const exIndex = existing.findIndex(e => e.equalsTypeAndID(model));
    //     if(exIndex === -1) {
    //       existing.push(model);
    //     }
    //     else {
    //       existing.splice(exIndex, 1, model);
    //     }
    //
    //     // const str = JSON.stringify(existing);
    //     // localStorage.setItem(this._tableKey, str);
    //
    //     if(doSave) {
    //       return this.saveInDb(existing);
    //     }
    //     else {
    //       BaseService._allItems = existing.slice();
    //       return of(null)
    //     }
    //
    //     // return doSave ? this.saveInDb(existing) : of(null);
    //   })
    // );
  }

  saveInDb(obj: any): Observable<null> {
    // localStorage.setItem(this._tableKey, str);
    // return of(null);

    return this.httpPost(environment.api + "/saveOne", obj).pipe(
      // tap(() => localStorage.setItem(this._tableKey, str))
      flatMap(() => {
        localStorage.setItem(this._tableKey, JSON.stringify(obj));
        return this.getAll(true).pipe(
          map(e => null)
        );
      })
    );
  }

  protected updateItem(model: any): Observable<any> {
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
}
