import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowFavorites } from './show-favorites';

describe('ShowFavorites', () => {
  let component: ShowFavorites;
  let fixture: ComponentFixture<ShowFavorites>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowFavorites],
    }).compileComponents();

    fixture = TestBed.createComponent(ShowFavorites);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
