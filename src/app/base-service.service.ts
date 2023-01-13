import {BehaviorSubject, Observable} from "rxjs";
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
