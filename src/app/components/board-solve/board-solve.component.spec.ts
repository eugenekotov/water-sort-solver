import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardSolveComponent } from './board-solve.component';

describe('BoardSolveComponent', () => {
  let component: BoardSolveComponent;
  let fixture: ComponentFixture<BoardSolveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoardSolveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardSolveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
