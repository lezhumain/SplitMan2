import { Injectable } from '@angular/core';
import {BaseService} from "./base-service.service";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../environments/environment";
import {ExpenseModel} from "./models/expense-model";

@Injectable({
  providedIn: 'root'
})
export class TestEndpointService extends BaseService {

  constructor(http: HttpClient) {
    super(http)
  }

  go(s: string): Observable<any> {
    return this.httpPost(environment.api + "/genimg", s, "arraybuffer", "image/png", false);
  }
}
