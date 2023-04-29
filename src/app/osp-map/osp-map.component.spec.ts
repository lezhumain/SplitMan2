import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OspMapComponent } from './osp-map.component';

describe('OspMapComponent', () => {
  let component: OspMapComponent;
  let fixture: ComponentFixture<OspMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OspMapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OspMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
