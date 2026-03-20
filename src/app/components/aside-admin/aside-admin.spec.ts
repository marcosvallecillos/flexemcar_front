import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsideAdmin } from './aside-admin';

describe('AsideAdmin', () => {
  let component: AsideAdmin;
  let fixture: ComponentFixture<AsideAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsideAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(AsideAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
