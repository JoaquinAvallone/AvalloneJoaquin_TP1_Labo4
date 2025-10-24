import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AimTrainer } from './aim-trainer';

describe('AimTrainer', () => {
  let component: AimTrainer;
  let fixture: ComponentFixture<AimTrainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AimTrainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AimTrainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
