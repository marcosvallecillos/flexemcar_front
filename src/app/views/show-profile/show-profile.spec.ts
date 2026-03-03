import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowProfile } from './show-profile';

describe('ShowProfile', () => {
  let component: ShowProfile;
  let fixture: ComponentFixture<ShowProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(ShowProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
