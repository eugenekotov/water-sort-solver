import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllColorsItemComponent } from './all-colors-item.component';

describe('AllColorsItemComponent', () => {
  let component: AllColorsItemComponent;
  let fixture: ComponentFixture<AllColorsItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllColorsItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllColorsItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
