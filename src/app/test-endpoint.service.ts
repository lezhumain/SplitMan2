import { Injectable } from '@angular/core';
import {BaseService} from "./base-service.service";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../environments/environment";
import {ExpenseModel} from "./models/expense-model";
import {ApiService} from "./api.service";

@Injectable({
  providedIn: 'root'
})
export class TestEndpointService extends BaseService {

  constructor(http: HttpClient, private readonly _apiService: ApiService) {
    super(http)
  }

  go(s: FormData): Observable<Blob> {
    return this._apiService.httpPost(environment.api + "/genimg", s, "blob", "image/png",
    false, "body");
  }
}
