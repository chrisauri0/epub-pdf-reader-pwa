import { TestBed } from '@angular/core/testing';
import { PdfReader } from './pdf-reader';

describe('PdfReader', () => {
  let service: PdfReader;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfReader);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
