import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantEditComponent } from './participant-edit.component';
import {ActivatedRoute} from "@angular/router";
import {AppRoutingModule} from "../app-routing/app-routing.module";
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('ParticipantEditComponent', () => {
  let component: ParticipantEditComponent;
  let fixture: ComponentFixture<ParticipantEditComponent>;
  const fakeActivatedRoute = <any>{
    snapshot: {
      data: {},
      paramMap: {
        get: (name: string) => {
          switch (name) {
            case "travelID":
              1;
              break;
            case "participantID":
              1;
              break;
          }
        }
      }
    }
  } as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParticipantEditComponent ],
      providers: [
        {provide: ActivatedRoute, useValue: fakeActivatedRoute}
      ],
      imports: [AppRoutingModule, HttpClientTestingModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
