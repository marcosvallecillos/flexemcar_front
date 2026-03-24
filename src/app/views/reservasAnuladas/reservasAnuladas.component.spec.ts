import { ComponentFixture, TestBed } from '@angular/core/testing';

import { reservasAnuladas } from './reservasAnuladas.component';

describe('reservasAnuladas', () => {
  let component: reservasAnuladas;
  let fixture: ComponentFixture<reservasAnuladas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [reservasAnuladas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(reservasAnuladas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
