import { Injectable } from '@angular/core';
import {Observable, of} from "rxjs";

import data1 from "src/assets/res.json";

export interface IIpInfo {
  lon: number,
  lat: number,
  query: string
  diff?: number;
}
@Injectable({
  providedIn: 'root'
})
export class IpInfoService {

  constructor() { }

  getIpData(): Observable<IIpInfo[]> {
    return of(data1.slice());
  }
}
