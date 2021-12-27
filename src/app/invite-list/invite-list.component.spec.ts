import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteListComponent } from './invite-list.component';
import {ActivatedRoute} from "@angular/router";
import {AppRoutingModule} from "../app-routing/app-routing.module";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {getBaseTestStuff} from "../../../e2e/baseTestStuff";
import {RepartitionCardComponent} from "../repartition-card/repartition-card.component";

describe('InviteListComponent', () => {
  let component: InviteListComponent;
  let fixture: ComponentFixture<InviteListComponent>;
  let fakeActivatedRoute;

  beforeEach(async () => {
    const baseStuff = getBaseTestStuff([ InviteListComponent ], {"userID": 1});
    fakeActivatedRoute = baseStuff[0];

    await TestBed.configureTestingModule(baseStuff[1] as any).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InviteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
