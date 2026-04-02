import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollVideo } from './scroll-video';

describe('ScrollVideo', () => {
  let component: ScrollVideo;
  let fixture: ComponentFixture<ScrollVideo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrollVideo],
    }).compileComponents();

    fixture = TestBed.createComponent(ScrollVideo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
