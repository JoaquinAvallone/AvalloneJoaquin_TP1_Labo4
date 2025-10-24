import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MayorMenor } from './mayor-menor';

describe('MayorMenor', () => {
  let component: MayorMenor;
  let fixture: ComponentFixture<MayorMenor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MayorMenor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MayorMenor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
