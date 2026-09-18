import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadBook } from './upload-book';

describe('UploadBook', () => {
  let component: UploadBook;
  let fixture: ComponentFixture<UploadBook>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadBook],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadBook);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
