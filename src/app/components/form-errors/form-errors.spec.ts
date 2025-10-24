import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormErrors } from './form-errors';

describe('FormErrors', () => {
  let component: FormErrors;
  let fixture: ComponentFixture<FormErrors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormErrors]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormErrors);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
