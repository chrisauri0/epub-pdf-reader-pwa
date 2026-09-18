import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EpubViewer } from './epub-viewer';

describe('EpubViewer', () => {
  let component: EpubViewer;
  let fixture: ComponentFixture<EpubViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpubViewer],
    }).compileComponents();

    fixture = TestBed.createComponent(EpubViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
