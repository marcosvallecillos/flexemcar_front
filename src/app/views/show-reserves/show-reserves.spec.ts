import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowReserves } from './show-reserves';

describe('ShowReserves', () => {
  let component: ShowReserves;
  let fixture: ComponentFixture<ShowReserves>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowReserves],
    }).compileComponents();

    fixture = TestBed.createComponent(ShowReserves);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
