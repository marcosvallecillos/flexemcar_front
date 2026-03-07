import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowVehicles } from './show-vehicles';

describe('ShowVehicles', () => {
  let component: ShowVehicles;
  let fixture: ComponentFixture<ShowVehicles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowVehicles],
    }).compileComponents();

    fixture = TestBed.createComponent(ShowVehicles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
