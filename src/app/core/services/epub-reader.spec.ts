import { TestBed } from '@angular/core/testing';
import { EpubReader } from './epub-reader';

describe('EpubReader', () => {
  let service: EpubReader;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EpubReader);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
