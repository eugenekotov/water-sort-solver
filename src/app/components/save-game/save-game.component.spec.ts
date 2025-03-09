import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveGameComponent } from './save-game.component';

describe('SaveGameComponent', () => {
  let component: SaveGameComponent;
  let fixture: ComponentFixture<SaveGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaveGameComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaveGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
