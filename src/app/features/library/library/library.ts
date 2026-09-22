import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LibraryService } from '../../../core/services/library';
import { Book } from '../../../core/models/book';
import { UploadBookComponent } from '../upload-book/upload-book';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [UploadBookComponent],
  templateUrl: './library.html',
  styleUrl: './library.scss',
})
export class LibraryComponent implements OnInit {
  books = signal<Book[]>([]);
  isLoading = signal(true);

  constructor(
    private libraryService: LibraryService,
    private router: Router
  ) {}


  errorMessage = signal<string | null>(null);

async ngOnInit(): Promise<void> {
  try {
    await this.loadBooks();
  } catch (err) {
    console.error(err);
    this.errorMessage.set(err instanceof Error ? err.message : String(err));
    this.isLoading.set(false);
  }
}


  async loadBooks(): Promise<void> {
    this.isLoading.set(true);
    const books = await this.libraryService.getAllBooks();
    // más recientes primero
    this.books.set(books.reverse());
    this.isLoading.set(false);
  }

  onBookAdded(book: Book): void {
    this.books.update((current) => [book, ...current]);
  }

  openBook(book: Book): void {
    this.router.navigate(['/read', book.type, book.id]);
  }

  async deleteBook(book: Book, event: Event): Promise<void> {
    event.stopPropagation(); // evita que dispare openBook al hacer click en el botón de borrar
    await this.libraryService.deleteBook(book.id);
    this.books.update((current) => current.filter((b) => b.id !== book.id));
  }

  formatProgress(progress?: number): string {
    if (!progress) return '';
    return `${Math.round(progress * 100)}%`;
  }
}
