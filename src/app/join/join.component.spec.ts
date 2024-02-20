import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinComponent } from './join.component';
import {getBaseTestStuff} from "../../../e2e/baseTestStuff";

describe('JoinComponent', () => {
  let component: JoinComponent;
  let fixture: ComponentFixture<JoinComponent>;
  let fakeActivatedRoute;

  // beforeEach(() => {
  //   TestBed.configureTestingModule({
  //     declarations: [JoinComponent]
  //   });
  //   fixture = TestBed.createComponent(JoinComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });
  beforeEach(async () => {
    const baseStuff = getBaseTestStuff([ JoinComponent ], { "link": "fghbnrstd" });
    fakeActivatedRoute = baseStuff[0];
    await TestBed.configureTestingModule(baseStuff[1] as any).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    // TODO check navigation
  });
});
