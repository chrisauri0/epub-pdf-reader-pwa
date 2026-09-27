import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';

@Injectable({ providedIn: 'root' })
export class PdfReaderService {
  private currentDoc?: PDFDocumentProxy;
  private currentLoadingTask?: pdfjsLib.PDFDocumentLoadingTask;

  async loadDocument(file: Blob): Promise<PDFDocumentProxy> {
    const arrayBuffer = await file.arrayBuffer();
    this.currentLoadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    this.currentDoc = await this.currentLoadingTask.promise;
    return this.currentDoc;
  }

  async getPage(pageNumber: number): Promise<PDFPageProxy> {
    if (!this.currentDoc) throw new Error('No hay documento cargado');
    return this.currentDoc.getPage(pageNumber);
  }

  /**
   * Renderiza la página ajustada al ancho del contenedor (fit-to-width),
   * usando devicePixelRatio para que se vea nítido en pantallas retina como el iPad.
   */
  async renderPageToCanvas(
    page: PDFPageProxy,
    canvas: HTMLCanvasElement,
    containerWidth: number
  ): Promise<void> {
    const baseViewport = page.getViewport({ scale: 1 });
    const fitScale = containerWidth / baseViewport.width;
    const pixelRatio = window.devicePixelRatio || 1;
    const renderScale = fitScale * pixelRatio;

    const viewport = page.getViewport({ scale: renderScale });
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No se pudo obtener contexto 2D del canvas');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Tamaño visual en CSS (más pequeño que el buffer real, por el pixelRatio)
    canvas.style.width = `${viewport.width / pixelRatio}px`;
    canvas.style.height = `${viewport.height / pixelRatio}px`;

    await page.render({
      canvasContext: context,
      viewport,
      canvas,
    }).promise;
  }

  get numPages(): number {
    return this.currentDoc?.numPages ?? 0;
  }

  async destroy(): Promise<void> {
    if (this.currentLoadingTask) {
      await this.currentLoadingTask.destroy();
    }
    this.currentDoc = undefined;
    this.currentLoadingTask = undefined;
  }
}
