import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {ApiService} from "./api.service";
import {environment} from "../environments/environment";
import {map, take} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class LinkService {

  constructor(private readonly _apiService: ApiService) { }

  generateLink(param: { travelID: number | null; userID: number }): Observable<string> {
    return this._apiService.httpPost(environment.api + "/generateLink", param).pipe(
      take(1),
      map((r: any) => {
        console.log("generateLink: %o", r);
        return r.link;
      })
    );
  }

  inviteFromLink(link: string): Observable<void> {
    // return this._apiService.httpPost(environment.api + "/join?link=" + encodeURIComponent(link), {}).pipe(
    return this._apiService.httpPost(environment.api + "/join?link=" + link, {}).pipe(
      take(1),
      map((r: any) => {})
    );
  }
}
