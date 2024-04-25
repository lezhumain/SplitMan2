import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceComponent } from './balance.component';
import {IBalanceItem} from "../utilities/splitwiseHelper";
import {BalanceItemComponent} from "../balance-item/balance-item.component";

describe('BalanceComponent', () => {
  let component: BalanceComponent;
  let fixture: ComponentFixture<BalanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BalanceComponent, BalanceItemComponent]
    });
    fixture = TestBed.createComponent(BalanceComponent);
    component = fixture.componentInstance;
    component.balance = [{
      name: "dju",
      amount: 1.00
    } as IBalanceItem]
    fixture.detectChanges();
  });

  it('should display if not 0', () => {
    expect(component).toBeTruthy();
    let els = fixture.debugElement.nativeElement.querySelectorAll("app-balance-item");
    expect(els).toBeTruthy();
    expect(els.length).toEqual(1);

    component.balance = [{
      name: "dju",
      amount: 1.00
    } as IBalanceItem]
    fixture.detectChanges();
    els = fixture.debugElement.nativeElement.querySelectorAll("app-balance-item");
    expect(els.length).toEqual(1);

  });

  it('should not display if 0', () => {
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
