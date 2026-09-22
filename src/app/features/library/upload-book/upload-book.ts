import { Component, output } from '@angular/core';
import { LibraryService } from '../../../core/services/library';
import { Book, BookType } from '../../../core/models/book';
import ePub from 'epubjs';

@Component({
  selector: 'app-upload-book',
  standalone: true,
  templateUrl: './upload-book.html',
  styleUrl: './upload-book.scss',
})
export class UploadBookComponent {
  bookAdded = output<Book>();
  isUploading = false;
  errorMessage = '';

  constructor(private libraryService: LibraryService) {}

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.errorMessage = '';
    this.isUploading = true;

    try {
      const type = this.detectType(file);
      if (!type) {
        this.errorMessage = 'Formato no soportado. Solo EPUB o PDF.';
        return;
      }

      const book: Book = {
        id: crypto.randomUUID(),
        title: await this.extractTitle(file, type),
        type,
        file,
        addedAt: Date.now(),
        progress: 0,
      };

      await this.libraryService.addBook(book);
      this.bookAdded.emit(book);
    } catch (err) {
      console.error('Error al procesar el libro:', err);
      this.errorMessage = 'No se pudo procesar el archivo.';
    } finally {
      this.isUploading = false;
      input.value = ''; // permite volver a subir el mismo archivo si hace falta
    }
  }

  private detectType(file: File): BookType | null {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) return 'pdf';
    if (file.type === 'application/epub+zip' || file.name.endsWith('.epub')) return 'epub';
    return null;
  }

  private async extractTitle(file: File, type: BookType): Promise<string> {
    if (type === 'epub') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const book = ePub(arrayBuffer);
        await book.ready;
        const metadata = await book.loaded.metadata;
        book.destroy();
        return metadata.title || this.filenameToTitle(file.name);
      } catch {
        return this.filenameToTitle(file.name);
      }
    }
    // Para PDF no vale la pena parsear metadata solo por el título, usamos el filename
    return this.filenameToTitle(file.name);
  }

  private filenameToTitle(filename: string): string {
    return filename.replace(/\.(epub|pdf)$/i, '').replace(/[-_]/g, ' ');
  }
}
