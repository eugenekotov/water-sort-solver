import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardInProgressComponent } from './board-in-progress.component';

describe('BoardInProgressComponent', () => {
    let component: BoardInProgressComponent;
    let fixture: ComponentFixture<BoardInProgressComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BoardInProgressComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(BoardInProgressComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
