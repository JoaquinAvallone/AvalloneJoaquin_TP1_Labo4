import { TestBed } from '@angular/core/testing';

import { Puntajes } from './puntajes';

describe('Puntajes', () => {
  let service: Puntajes;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Puntajes);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
