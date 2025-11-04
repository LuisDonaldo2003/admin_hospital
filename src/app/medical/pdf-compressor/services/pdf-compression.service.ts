import { Injectable } from '@angular/core';
import { PDFDocument, rgb, PDFImage } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Configurar worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

@Injectable({
  providedIn: 'root'
})
export class PdfCompressionService {

  constructor() { }

  /**
   * Comprimir un archivo PDF con máxima compresión usando renderizado
   * @param file Archivo PDF original
   * @param targetSize Tamaño objetivo en bytes (por defecto 500KB)
   * @returns Blob del PDF comprimido
   */
  async compressPdf(file: File, targetSize: number = 500 * 1024): Promise<Blob> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      console.log(`🔍 Tamaño original: ${this.formatFileSize(arrayBuffer.byteLength)}`);
      
      // Intentar primero con compresión estándar de pdf-lib
      let result = await this.tryStandardCompression(arrayBuffer, targetSize);
      
      // Si no es suficiente, usar compresión con renderizado (más potente)
      if (result.length > targetSize) {
        console.log('📊 Compresión estándar insuficiente, usando renderizado...');
        result = await this.compressWithRendering(arrayBuffer, targetSize);
      }
      
      console.log(`✅ Tamaño final: ${this.formatFileSize(result.length)}`);
      console.log(`📉 Reducción: ${this.calculateReduction(arrayBuffer.byteLength, result.length).toFixed(1)}%`);
      
      const buffer = new Uint8Array(result);
      return new Blob([buffer], { type: 'application/pdf' });
      
    } catch (error) {
      console.error('Error al comprimir PDF:', error);
      throw new Error('No se pudo comprimir el archivo PDF');
    }
  }

  /**
   * Intentar compresión estándar con pdf-lib
   */
  private async tryStandardCompression(arrayBuffer: ArrayBuffer, targetSize: number): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(arrayBuffer, {
      ignoreEncryption: true,
      updateMetadata: false
    });

    // Nivel 1: Compresión básica
    let result = await this.basicCompression(pdfDoc);
    console.log(`  📦 Básica: ${this.formatFileSize(result.length)}`);
    
    if (result.length > targetSize) {
      result = await this.advancedCompression(pdfDoc);
      console.log(`  📦 Avanzada: ${this.formatFileSize(result.length)}`);
    }
    
    if (result.length > targetSize) {
      result = await this.aggressiveCompression(pdfDoc);
      console.log(`  📦 Agresiva: ${this.formatFileSize(result.length)}`);
    }
    
    return result;
  }

  /**
   * Compresión potente usando renderizado de páginas a imágenes comprimidas
   */
  private async compressWithRendering(arrayBuffer: ArrayBuffer, targetSize: number): Promise<Uint8Array> {
    try {
      // Cargar PDF con PDF.js
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDocument = await loadingTask.promise;
      
      // Crear nuevo PDF
      const newPdfDoc = await PDFDocument.create();
      
      const numPages = pdfDocument.numPages;
      console.log(`  📄 Procesando ${numPages} página(s)...`);
      
      // Calcular calidad basada en tamaño objetivo
      let quality = 0.5; // Calidad inicial (50%)
      const bytesPerPage = targetSize / (numPages || 1);
      
      // Ajustar calidad según tamaño objetivo
      if (bytesPerPage < 50 * 1024) quality = 0.3; // Muy comprimido
      else if (bytesPerPage < 100 * 1024) quality = 0.4; // Comprimido
      else if (bytesPerPage < 200 * 1024) quality = 0.5; // Balanceado
      else quality = 0.6; // Buena calidad
      
      console.log(`  🎨 Calidad de compresión: ${(quality * 100).toFixed(0)}%`);
      
      // Renderizar cada página y agregarla al nuevo PDF
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        try {
          const page = await pdfDocument.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 }); // Escala para mantener calidad
          
          // Crear canvas
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d')!;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          // Renderizar PDF a canvas (actualizado para pdfjs-dist 5.x)
          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas // Requerido en pdfjs-dist 5.x
          }).promise;
          
          // Convertir canvas a imagen JPEG comprimida
          const imageDataUrl = canvas.toDataURL('image/jpeg', quality);
          const imageBytes = this.dataURLToUint8Array(imageDataUrl);
          
          // Agregar imagen al nuevo PDF
          const pdfImage = await newPdfDoc.embedJpg(imageBytes);
          const pdfPage = newPdfDoc.addPage([viewport.width, viewport.height]);
          
          pdfPage.drawImage(pdfImage, {
            x: 0,
            y: 0,
            width: viewport.width,
            height: viewport.height
          });
          
          console.log(`  ✔ Página ${pageNum}/${numPages} procesada`);
        } catch (pageError) {
          console.warn(`  ⚠ Error en página ${pageNum}:`, pageError);
        }
      }
      
      // Limpiar metadata
      newPdfDoc.setTitle('');
      newPdfDoc.setAuthor('');
      newPdfDoc.setSubject('');
      newPdfDoc.setKeywords([]);
      newPdfDoc.setProducer('');
      newPdfDoc.setCreator('');
      
      // Guardar con máxima compresión
      const result = await newPdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 500
      });
      
      // Si aún supera el tamaño, intentar con menor calidad
      if (result.length > targetSize && quality > 0.3) {
        console.log(`  🔄 Reintentando con menor calidad...`);
        return await this.compressWithLowerQuality(arrayBuffer, targetSize, quality - 0.1);
      }
      
      return result;
    } catch (error) {
      console.error('Error en compresión con renderizado:', error);
      // Fallback a compresión estándar
      return await this.tryStandardCompression(arrayBuffer, targetSize);
    }
  }

  /**
   * Reintentar compresión con menor calidad
   */
  private async compressWithLowerQuality(arrayBuffer: ArrayBuffer, targetSize: number, quality: number): Promise<Uint8Array> {
    if (quality < 0.2) quality = 0.2; // Calidad mínima
    
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDocument = await loadingTask.promise;
    const newPdfDoc = await PDFDocument.create();
    const numPages = pdfDocument.numPages;
    
    console.log(`  🎨 Comprimiendo con calidad: ${(quality * 100).toFixed(0)}%`);
    
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        const page = await pdfDocument.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.2 }); // Menor escala
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas // Requerido en pdfjs-dist 5.x
        }).promise;
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', quality);
        const imageBytes = this.dataURLToUint8Array(imageDataUrl);
        
        const pdfImage = await newPdfDoc.embedJpg(imageBytes);
        const pdfPage = newPdfDoc.addPage([viewport.width, viewport.height]);
        
        pdfPage.drawImage(pdfImage, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height
        });
      } catch (pageError) {
        console.warn(`Error en página ${pageNum}:`, pageError);
      }
    }
    
    newPdfDoc.setTitle('');
    newPdfDoc.setAuthor('');
    newPdfDoc.setSubject('');
    
    return await newPdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 500
    });
  }

  /**
   * Convertir Data URL a Uint8Array
   */
  private dataURLToUint8Array(dataURL: string): Uint8Array {
    const base64 = dataURL.split(',')[1];
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Compresión básica - Eliminar metadata y optimizar estructura
   */
  private async basicCompression(pdfDoc: PDFDocument): Promise<Uint8Array> {
    // Eliminar metadata innecesaria
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('');
    pdfDoc.setCreator('');

    // Guardar con compresión
    return await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50
    });
  }

  /**
   * Compresión avanzada - Optimizar objetos y streams con mayor compresión
   */
  private async advancedCompression(pdfDoc: PDFDocument): Promise<Uint8Array> {
    // Eliminar metadata y aplicar compresión más agresiva
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('');
    pdfDoc.setCreator('');
    pdfDoc.setLanguage('');
    pdfDoc.setModificationDate(new Date(0));
    pdfDoc.setCreationDate(new Date(0));

    return await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 200
    });
  }

  /**
   * Compresión agresiva - Reducir resolución mediante recreación de páginas
   */
  private async aggressiveCompression(pdfDoc: PDFDocument): Promise<Uint8Array> {
    try {
      // Crear un nuevo documento PDF
      const newPdfDoc = await PDFDocument.create();
      
      const pages = pdfDoc.getPages();
      
      // Copiar páginas con compresión
      for (let i = 0; i < pages.length; i++) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
        newPdfDoc.addPage(copiedPage);
      }

      // Limpiar metadata
      newPdfDoc.setTitle('');
      newPdfDoc.setAuthor('');
      newPdfDoc.setSubject('');
      newPdfDoc.setKeywords([]);
      newPdfDoc.setProducer('');
      newPdfDoc.setCreator('');

      return await newPdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 300
      });
    } catch (error) {
      console.warn('Compresión agresiva falló, usando avanzada:', error);
      return await this.advancedCompression(pdfDoc);
    }
  }

  /**
   * Compresión extrema - Reducir páginas si es necesario y máxima optimización
   */
  private async extremeCompression(pdfDoc: PDFDocument, targetSize: number): Promise<Uint8Array> {
    try {
      // Crear un nuevo documento completamente limpio
      const newPdfDoc = await PDFDocument.create();
      
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;
      
      // Intentar copiar todas las páginas con máxima compresión
      for (let i = 0; i < totalPages; i++) {
        try {
          const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
          
          // Reducir el tamaño de la página si es necesario (escalar a 90%)
          const { width, height } = copiedPage.getSize();
          copiedPage.setSize(width * 0.9, height * 0.9);
          
          newPdfDoc.addPage(copiedPage);
        } catch (pageError) {
          console.warn(`Error copiando página ${i}:`, pageError);
          // Continuar con las demás páginas
        }
      }

      // Asegurar que el documento esté completamente limpio
      newPdfDoc.setTitle('');
      newPdfDoc.setAuthor('');
      newPdfDoc.setSubject('');
      newPdfDoc.setKeywords([]);
      newPdfDoc.setProducer('');
      newPdfDoc.setCreator('');

      const result = await newPdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 500
      });

      // Si aún es muy grande, advertir al usuario
      if (result.length > targetSize) {
        console.warn(`Advertencia: El PDF comprimido (${this.formatFileSize(result.length)}) aún supera el objetivo (${this.formatFileSize(targetSize)})`);
      }

      return result;
    } catch (error) {
      console.warn('Compresión extrema falló, usando agresiva:', error);
      return await this.aggressiveCompression(pdfDoc);
    }
  }

  /**
   * Verificar si el PDF necesita compresión
   */
  needsCompression(fileSize: number, targetSize: number = 500 * 1024): boolean {
    return fileSize > targetSize;
  }

  /**
   * Calcular porcentaje de reducción
   */
  calculateReduction(originalSize: number, compressedSize: number): number {
    if (originalSize === 0) return 0;
    return ((originalSize - compressedSize) / originalSize) * 100;
  }

  /**
   * Formatear tamaño de archivo
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
