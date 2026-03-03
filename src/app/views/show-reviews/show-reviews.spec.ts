import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowReviews } from './show-reviews';

describe('ShowReviews', () => {
  let component: ShowReviews;
  let fixture: ComponentFixture<ShowReviews>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowReviews],
    }).compileComponents();

    fixture = TestBed.createComponent(ShowReviews);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
