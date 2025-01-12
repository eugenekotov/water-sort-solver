import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardPlayComponent } from './board-play.component';

describe('BoardPlayComponent', () => {
  let component: BoardPlayComponent;
  let fixture: ComponentFixture<BoardPlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoardPlayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardPlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
