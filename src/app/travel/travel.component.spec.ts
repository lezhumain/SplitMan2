import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelComponent } from './travel.component';
import {ExpenseModel} from "../models/expense-model";
import {AppRoutingModule} from "../app-routing/app-routing.module";
import {Router} from "@angular/router";
import {TravelService} from "../travel.service";
import {ExpenseService} from "../expense.service";
import {NavBarService} from "../nav-bar.service";
import {UserServiceService} from "../user-service.service";
import {getExpenses} from "../models/expense-model.spec";
import {HttpClientTestingModule} from "@angular/common/http/testing";

// function getExpenses(): ExpenseModel[] {
//   return [
//     {
//       "id": 6,
//       "tripId": 2,
//       "name": "Campin",
//       "amount": 300,
//       "date": "2022-01-10T00:00:00.000Z",
//       "payer": "Dju",
//       "payees": [
//         {"name": "Dju", "e4xpenseRatio": 0.333333333},
//         {"name": "Cams", "e4xpenseRatio": 0.333333333},
//         {"name": "Alx", "e4xpenseRatio": 0.333333333}
//       ],
//       "createdAt": "2021-10-31T17:31:29.665Z",
//       "createdBy": "",
//       "updatedAt": "2021-10-31T17:31:29.665Z",
//       "updatedBy": ""
//     },
//     {
//       "id": 7,
//       "tripId": 2,
//       "name": "Z",
//       "amount": 20,
//       "date": "2021-10-31T17:36:06.265Z",
//       "payer": "Cams",
//       "payees": [
//         {"name": "Dju", "e4xpenseRatio": 0.5},
//         {"name": "Cams", "e4xpenseRatio": 0.5}
//       ],
//       "createdAt": "2021-10-31T17:36:41.735Z",
//       "createdBy": "",
//       "updatedAt": "2021-10-31T17:36:41.735Z",
//       "updatedBy": ""
//     },
//     {
//       "id": 8,
//       "tripId": 2,
//       "name": "trajet",
//       "amount": 30,
//       "date": "2021-10-31T17:58:07.836Z",
//       "payer": "Alx",
//       "payees": [
//         {"name": "Dju", "e4xpenseRatio": 0.333333333},
//         {"name": "Cams", "e4xpenseRatio": 0.333333333},
//         {"name": "Alx", "e4xpenseRatio": 0.333333333}
//       ],
//       "createdAt": "2021-10-31T17:58:46.016Z",
//       "createdBy": "",
//       "updatedAt": "2021-10-31T17:58:46.016Z",
//       "updatedBy": ""
//     }
//   ].map(e => ExpenseModel.fromJson(e));
// }

describe('TravelComponent', () => {
  let component: TravelComponent;
  let fixture: ComponentFixture<TravelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TravelComponent ],
      providers: [TravelService, ExpenseService, NavBarService, UserServiceService],
      imports:[AppRoutingModule, HttpClientTestingModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
