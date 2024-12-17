import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardNoSolutionComponent } from './board-no-solution.component';

describe('BoardNoSolutionComponent', () => {
  let component: BoardNoSolutionComponent;
  let fixture: ComponentFixture<BoardNoSolutionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoardNoSolutionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardNoSolutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
