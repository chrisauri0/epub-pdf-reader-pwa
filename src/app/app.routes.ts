import { Routes } from '@angular/router';
import { LibraryComponent } from './features/library/library/library';
import { EpubViewerComponent } from './features/epub-viewer/epub-viewer/epub-viewer';
import { PdfViewerComponent } from './features/pdf-viewer/pdf-viewer/pdf-viewer';

export const routes: Routes = [
  { path: '', component: LibraryComponent },
  { path: 'read/epub/:id', component: EpubViewerComponent },
  { path: 'read/pdf/:id', component: PdfViewerComponent },
  { path: '**', redirectTo: '' },
];
