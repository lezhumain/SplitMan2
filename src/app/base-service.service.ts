import {UserModel} from "./models/user-model";
import {BehaviorSubject, combineLatest, Observable, of} from "rxjs";
import {User} from "./models/user";
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  first,
  map,
  shareReplay,
  skip,
  take,
  tap
} from "rxjs/operators";
import {BaseItem} from "./models/baseItem";
import {ajax, AjaxRequest} from "rxjs/ajax";
import {flatMap} from "rxjs/internal/operators";
import {UserServiceService} from "./user-service.service";
import {environment} from "../environments/environment";
import {badData} from "../../e2e/data/bugData";
import {AjaxObservable} from "rxjs/internal-compatibility";
import {HttpHeaders, HttpRequest} from "@angular/common/http";
import { HttpClient } from '@angular/common/http';

enum BaseServiceState {
  NEW,
  LOADING,
  LOADED
}

export class BaseService {
  protected static USER_ID: number| null = null;
  static USER_ID_INIT: number | null = null;

  // private static loaded = false;
  private static state$: BehaviorSubject<BaseServiceState> = new BehaviorSubject<BaseServiceState>(BaseServiceState.NEW);
  private static allCache?: Observable<any>;

  constructor(private http: HttpClient) {
    // BaseService._allItems$.pipe(
    //   distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    // ).subscribe((i) => {
    //   console.log("[AllItems]:");
    //   console.log(i);
    // })
  }


}
