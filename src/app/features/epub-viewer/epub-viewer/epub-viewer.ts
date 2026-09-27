import { Component, OnInit, OnDestroy, ElementRef, ViewChild, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { EpubReaderService } from '../../../core/services/epub-reader';
import { LibraryService } from '../../../core/services/library';
import { Book } from '../../../core/models/book';

@Component({
  selector: 'app-epub-viewer',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './epub-viewer.html',
  styleUrl: './epub-viewer.scss',
})
export class EpubViewerComponent implements OnInit, OnDestroy {
  @ViewChild('viewerContainer', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  book?: Book;
  progress = signal(0);
  isLoading = signal(true);
  fontSize = signal(100);

  private touchStartX = 0;
  private touchStartY = 0;
  private readonly SWIPE_THRESHOLD = 50;
  private readonly SWIPE_MAX_VERTICAL = 60;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private epubReader: EpubReaderService,
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

    await this.epubReader.loadBook(this.book.file);
    this.epubReader.renderTo(this.containerRef.nativeElement, this.book.currentLocation);

    this.epubReader.generateLocations().then(() => this.updateProgress());

    this.isLoading.set(false);
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }

  onTouchEnd(event: TouchEvent): void {
    const deltaX = event.changedTouches[0].clientX - this.touchStartX;
    const deltaY = event.changedTouches[0].clientY - this.touchStartY;

    if (Math.abs(deltaY) > this.SWIPE_MAX_VERTICAL) return;
    if (Math.abs(deltaX) < this.SWIPE_THRESHOLD) return;

    if (deltaX < 0) {
      this.nextPage();
    } else {
      this.prevPage();
    }
  }

  async nextPage(): Promise<void> {
    this.epubReader.next();
    await this.saveProgress();
  }

  async prevPage(): Promise<void> {
    this.epubReader.prev();
    await this.saveProgress();
  }

  increaseFontSize(): void {
    this.fontSize.update((s) => Math.min(s + 10, 200));
    this.epubReader.setFontSize(`${this.fontSize()}%`);
  }

  decreaseFontSize(): void {
    this.fontSize.update((s) => Math.max(s - 10, 60));
    this.epubReader.setFontSize(`${this.fontSize()}%`);
  }

  toggleTheme(): void {
    const isDark = document.body.classList.toggle('dark-theme');
    this.epubReader.setTheme(isDark ? 'dark' : 'light');
  }

  private async updateProgress(): Promise<void> {
    const p = await this.epubReader.getProgress();
    this.progress.set(p);
  }

  private async saveProgress(): Promise<void> {
    if (!this.book) return;
    const cfi = this.epubReader.currentLocation;
    if (!cfi) return;
    await this.updateProgress();
    await this.libraryService.updateProgress(this.book.id, this.progress(), cfi);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.epubReader.destroy();
  }
}
