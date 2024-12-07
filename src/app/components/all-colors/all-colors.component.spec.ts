import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllColorsComponent } from './all-colors.component';

describe('AllColorsComponent', () => {
  let component: AllColorsComponent;
  let fixture: ComponentFixture<AllColorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllColorsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllColorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
