import { Component, OnInit, OnDestroy, ElementRef, ViewChild, signal, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PdfReaderService } from '../../../core/services/pdf-reader';
import { LibraryService } from '../../../core/services/library';
import { Book } from '../../../core/models/book';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  templateUrl: './pdf-viewer.html',
  styleUrl: './pdf-viewer.scss',
})
export class PdfViewerComponent implements OnInit, OnDestroy {
  @ViewChild('pdfCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  book?: Book;
  currentPage = signal(1);
  totalPages = signal(0);
  isLoading = signal(true);

  private touchStartX = 0;
  private touchStartY = 0;
  private readonly SWIPE_THRESHOLD = 50; // px mínimos para contar como swipe
  private readonly SWIPE_MAX_VERTICAL = 60; // tolerancia vertical, para no confundir con scroll

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pdfReader: PdfReaderService,
    private libraryService: LibraryService
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/']);
      return;
    }

    this.book = await this.libraryService.getBook(id);
    if (!this.book) {
      this.router.navigate(['/']);
      return;
    }

    await this.pdfReader.loadDocument(this.book.file);
    this.totalPages.set(this.pdfReader.numPages);

    const startPage = this.book.currentLocation ? parseInt(this.book.currentLocation, 10) : 1;
    this.currentPage.set(startPage || 1);

    await this.renderCurrentPage();
    this.isLoading.set(false);
  }

  private async renderCurrentPage(): Promise<void> {
    const page = await this.pdfReader.getPage(this.currentPage());
    const containerWidth = this.containerRef.nativeElement.clientWidth;
    await this.pdfReader.renderPageToCanvas(page, this.canvasRef.nativeElement, containerWidth);
  }

  @HostListener('window:resize')
  async onResize(): Promise<void> {
    if (!this.isLoading()) {
      await this.renderCurrentPage();
    }
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }

  onTouchEnd(event: TouchEvent): void {
    const deltaX = event.changedTouches[0].clientX - this.touchStartX;
    const deltaY = event.changedTouches[0].clientY - this.touchStartY;

    if (Math.abs(deltaY) > this.SWIPE_MAX_VERTICAL) return; // fue scroll vertical, ignorar
    if (Math.abs(deltaX) < this.SWIPE_THRESHOLD) return; // muy corto, no cuenta

    if (deltaX < 0) {
      this.nextPage();
    } else {
      this.prevPage();
    }
  }

  async nextPage(): Promise<void> {
    if (this.currentPage() >= this.totalPages()) return;
    this.currentPage.update((p) => p + 1);
    await this.renderCurrentPage();
    await this.saveProgress();
  }

  async prevPage(): Promise<void> {
    if (this.currentPage() <= 1) return;
    this.currentPage.update((p) => p - 1);
    await this.renderCurrentPage();
    await this.saveProgress();
  }

  private async saveProgress(): Promise<void> {
    if (!this.book) return;
    const progress = this.currentPage() / this.totalPages();
    await this.libraryService.updateProgress(this.book.id, progress, String(this.currentPage()));
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  async ngOnDestroy(): Promise<void> {
    await this.pdfReader.destroy();
  }
}
