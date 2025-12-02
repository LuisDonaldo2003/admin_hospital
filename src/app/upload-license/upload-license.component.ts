import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { URL_SERVICIOS } from '../config/config';

@Component({
  selector: 'app-upload-license',
  templateUrl: './upload-license.component.html',
  styleUrls: ['./upload-license.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class UploadLicenseComponent {
  selectedFile: File | null = null;
  uploading = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'license' || extension === 'key') {
        this.selectedFile = file;
        this.message = '';
      } else {
        this.message = 'Solo se permiten archivos .license o .key';
        this.messageType = 'error';
        this.selectedFile = null;
      }
    }
  }

  uploadLicense(): void {
    if (!this.selectedFile) {
      this.message = 'Por favor seleccione un archivo';
      this.messageType = 'error';
      return;
    }

    this.uploading = true;
    this.message = '';

    const formData = new FormData();
    formData.append('license_file', this.selectedFile);

    this.http.post(`${URL_SERVICIOS}/license/upload`, formData).subscribe({
      next: (response: any) => {
        this.uploading = false;
        this.message = response.message || '¡Licencia activada correctamente!';
        this.messageType = 'success';
        this.selectedFile = null;

        // Limpiar input
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err: any) => {
        this.uploading = false;
        this.message = err.error?.message || 'Error al activar la licencia. Verifique el archivo.';
        this.messageType = 'error';
      }
    });
  }
}
