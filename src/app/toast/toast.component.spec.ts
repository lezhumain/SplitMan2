import { ComponentFixture, TestBed } from '@angular/core/testing';

import {AppRoutingModule} from "../app-routing/app-routing.module";
import {TravelService} from "../travel.service";
import {ExpenseService} from "../expense.service";
import {NavBarService} from "../nav-bar.service";
import {UserServiceService} from "../user-service.service";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ToastComponent} from "./toast.component";

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ToastComponent ],
      providers: [TravelService, ExpenseService, NavBarService, UserServiceService],
      imports:[AppRoutingModule, HttpClientTestingModule]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
