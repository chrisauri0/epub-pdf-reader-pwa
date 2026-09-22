import { Injectable } from '@angular/core';
import ePub, { Book as EpubBook, Rendition } from 'epubjs';

@Injectable({ providedIn: 'root' })
export class EpubReaderService {
  private book?: EpubBook;
  private rendition?: Rendition;

  async loadBook(file: Blob): Promise<EpubBook> {
    const arrayBuffer = await file.arrayBuffer();
    this.book = ePub(arrayBuffer);
    await this.book.ready;
    return this.book;
  }

  renderTo(element: HTMLElement, startLocation?: string): Rendition {
    if (!this.book) throw new Error('No hay libro cargado');

    this.rendition = this.book.renderTo(element, {
      width: '100%',
      height: '100%',
      flow: 'paginated',
      spread: 'auto',
    });

    this.rendition.display(startLocation);
    return this.rendition;
  }

  next(): void {
    this.rendition?.next();
  }

  prev(): void {
    this.rendition?.prev();
  }

  setFontSize(size: string): void {
    this.rendition?.themes.fontSize(size);
  }

  setTheme(theme: 'light' | 'dark'): void {
    if (!this.rendition) return;
    this.rendition.themes.register('dark', { body: { background: '#1a1a1a', color: '#e0e0e0' } });
    this.rendition.themes.register('light', { body: { background: '#ffffff', color: '#000000' } });
    this.rendition.themes.select(theme);
  }

  get currentLocation(): string | undefined {
    return this.rendition?.currentLocation() ? (this.rendition.currentLocation() as any).start.cfi : undefined;
  }

  async getProgress(): Promise<number> {
    if (!this.book || !this.rendition) return 0;
    const loc = this.rendition.currentLocation() as any;
    if (!loc?.start?.cfi || !this.book.locations) return 0;
    return this.book.locations.percentageFromCfi(loc.start.cfi);
  }

  async generateLocations(): Promise<void> {
    // Necesario para que percentageFromCfi funcione — puede tardar en libros grandes
    await this.book?.locations.generate(1024);
  }

  destroy(): void {
    this.rendition?.destroy();
    this.book?.destroy();
    this.rendition = undefined;
    this.book = undefined;
  }
}
