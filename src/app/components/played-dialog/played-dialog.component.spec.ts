import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayedDialogComponent } from './played-dialog.component';

describe('PlayedDialogComponent', () => {
  let component: PlayedDialogComponent;
  let fixture: ComponentFixture<PlayedDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayedDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
