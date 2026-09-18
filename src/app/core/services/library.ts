import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Book } from '../models/book';

interface LibraryDB extends DBSchema {
  books: {
    key: string;
    value: Book;
    indexes: { 'by-addedAt': number };
  };
}

@Injectable({ providedIn: 'root' })
export class LibraryService {
  private dbPromise: Promise<IDBPDatabase<LibraryDB>>;

  constructor() {
    this.dbPromise = openDB<LibraryDB>('epub-pdf-reader-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('books', { keyPath: 'id' });
        store.createIndex('by-addedAt', 'addedAt');
      },
    });
  }

  async addBook(book: Book): Promise<void> {
    const db = await this.dbPromise;
    await db.put('books', book);
  }

  async getBook(id: string): Promise<Book | undefined> {
    const db = await this.dbPromise;
    return db.get('books', id);
  }

  async getAllBooks(): Promise<Book[]> {
    const db = await this.dbPromise;
    return db.getAllFromIndex('books', 'by-addedAt');
  }

  async updateProgress(id: string, progress: number, currentLocation: string): Promise<void> {
    const db = await this.dbPromise;
    const book = await db.get('books', id);
    if (!book) return;
    book.progress = progress;
    book.currentLocation = currentLocation;
    book.lastOpenedAt = Date.now();
    await db.put('books', book);
  }

  async deleteBook(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('books', id);
  }
}
