export type BookType = 'epub' | 'pdf';

export interface Book {
  id: string;              // uuid o hash del archivo
  title: string;
  type: BookType;
  file: Blob;               // el archivo crudo (epub o pdf)
  cover?: Blob;              // portada extraída, opcional
  addedAt: number;           // timestamp
  lastOpenedAt?: number;
  progress?: number;         // 0-1, porcentaje leído
  currentLocation?: string;  // cfi (epub) o número de página (pdf)
}

