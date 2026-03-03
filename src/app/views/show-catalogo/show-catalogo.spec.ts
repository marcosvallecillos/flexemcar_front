import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowCatalogo } from './show-catalogo';

describe('ShowCatalogo', () => {
  let component: ShowCatalogo;
  let fixture: ComponentFixture<ShowCatalogo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowCatalogo],
    }).compileComponents();

    fixture = TestBed.createComponent(ShowCatalogo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
