import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateServiceComponent } from './rate-service.component';

describe('RateServiceComponent', () => {
  let component: RateServiceComponent;
  let fixture: ComponentFixture<RateServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RateServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
