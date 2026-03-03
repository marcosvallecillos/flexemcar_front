import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowClients } from './show-clients';

describe('ShowClients', () => {
  let component: ShowClients;
  let fixture: ComponentFixture<ShowClients>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowClients],
    }).compileComponents();

    fixture = TestBed.createComponent(ShowClients);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
