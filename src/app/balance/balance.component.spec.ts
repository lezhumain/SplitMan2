import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceComponent } from './balance.component';
import {IBalanceItem} from "../utilities/splitwiseHelper";

describe('BalanceComponent', () => {
  let component: BalanceComponent;
  let fixture: ComponentFixture<BalanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BalanceComponent]
    });
    fixture = TestBed.createComponent(BalanceComponent);
    component = fixture.componentInstance;
    component.balance = [{
      name: "dju",
      amount: 1.00
    } as IBalanceItem]
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    let els = fixture.debugElement.nativeElement.querySelectorAll("app-balance-item");
    expect(els).toBeTruthy();
    expect(els.length).toEqual(1);

    component.balance = [{
      name: "dju",
      amount: 0.00
    } as IBalanceItem]
    fixture.detectChanges();
    els = fixture.debugElement.nativeElement.querySelectorAll("app-balance-item");
    expect(els.length).toEqual(0);

  });
});
