import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class NavBarService {
  private headerValue$: BehaviorSubject<string> = new BehaviorSubject<string>("Welcome");
  private backValue$: BehaviorSubject<string> = new BehaviorSubject<string>("");

  constructor() { }

  setHeaderValue(val: string) {
    this.headerValue$.next(val);
  }

  getHeaderValue(): Observable<string> {
    return this.headerValue$;
  }

  setBackValue(val: string) {
    this.backValue$.next(val);
  }

  getBackValue(): Observable<string> {
    return this.backValue$;
  }
}
