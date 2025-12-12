import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { URL_SERVICIOS } from '../config/config';
import { LicenseCheckGuard } from '../core/guards/license-check.guard';

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
  hardwareInfo: any = null;
  loadingHardware = false;
  hospitalInfo: any = null;
  errorDetails: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private licenseGuard: LicenseCheckGuard
  ) { }

  ngOnInit(): void {
    this.loadHardwareInfo();
  }

  loadHardwareInfo(): void {
    this.loadingHardware = true;
    this.http.get(`${URL_SERVICIOS}/license/hardware-info`).subscribe({
      next: (response: any) => {
        this.hardwareInfo = response;
        this.loadingHardware = false;
      },
      error: (err: any) => {
        console.error('Error loading hardware info:', err);
        this.loadingHardware = false;
      }
    });
  }

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
        this.hospitalInfo = response.license_info?.hospital_info;
        this.errorDetails = null;

        // Limpiar input
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        // Invalidar caché de licencia para que se verifique nuevamente
        this.licenseGuard.invalidateCache();

        // Redirigir después de 3 segundos usando window.location.replace
        // Esto fuerza una recarga completa de la página y evita problemas de caché de routing
        console.log('Licencia activada exitosamente, redirigiendo en 3 segundos...');
        setTimeout(() => {
          console.log('Redirigiendo a /login con recarga completa...');
          window.location.replace('/login');
        }, 3000); // 3 segundos para que el usuario vea la información
      },
      error: (err: any) => {
        this.uploading = false;
        this.messageType = 'error';
        this.errorDetails = err.error?.details;

        // Mensajes de error específicos según código
        switch (err.error?.error_code) {
          case 'HARDWARE_MISMATCH':
            this.message = '❌ Esta licencia no está autorizada para este servidor.';
            if (this.errorDetails) {
              this.message += ` Este servidor es: ${this.errorDetails.hostname}`;
            }
            break;

          case 'ALREADY_ACTIVATED':
            this.message = '❌ Esta licencia ya está activada en otro servidor.';
            if (this.errorDetails) {
              this.message += ` Activada en: ${this.errorDetails.hostname} el ${this.errorDetails.activated_at}`;
            }
            break;

          default:
            this.message = err.error?.message || 'Error al activar la licencia. Verifique el archivo.';
        }
      }
    });
  }

  getFormattedSignature(): string {
    if (!this.hardwareInfo?.signature) return 'Cargando...';
    const sig = this.hardwareInfo.signature;
    return `${sig.substring(0, 16)}...${sig.substring(sig.length - 8)}`;
  }

  goToLogin(): void {
    console.log('Navegación manual a /login');
    this.licenseGuard.invalidateCache();
    window.location.replace('/login');
  }
}
