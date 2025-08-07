import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ArchiveService } from '../service/archive.service';
import { ArchiveFormData } from '../models/location.interface';

@Component({
  selector: 'app-add-archive',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './add-archive.component.html',
  styleUrls: ['./add-archive.component.scss']
})
export class AddArchiveComponent implements OnInit {
  // Reactive Form
  archiveForm!: FormGroup;
  
  // Datos del formulario (simplificado)
  archive_number = '';
  name = '';
  last_name_father = '';
  last_name_mother = '';
  age: number | null = null;
  gender_id = '';
  address = '';
  location = '';  // Campo simple de texto para localidad
  admission_date = '';

  genders: any[] = [];

  submitted = false;
  text_validation = '';
  text_success = '';

  constructor(
    private archiveService: ArchiveService,
    private router: Router,
    private translate: TranslateService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.admission_date = new Date().toISOString().split('T')[0];
    this.loadGenders();
  }

  private initializeForm(): void {
    this.archiveForm = this.fb.group({
      archive_number: ['', [Validators.required, Validators.minLength(1), Validators.pattern(/^[A-Za-z0-9\-_]+$/)]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-zÀ-ÿ\u00f1\u00d1\s]+$/)]],
      last_name_father: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-zÀ-ÿ\u00f1\u00d1\s]+$/)]],
      last_name_mother: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-zÀ-ÿ\u00f1\u00d1\s]+$/)]],
      age: [null, [Validators.required, Validators.min(1), Validators.max(120), Validators.pattern(/^\d+$/)]],
      gender_id: ['', Validators.required],
      address: [''],
      admission_date: ['', Validators.required],
      location: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÿ\u00f1\u00d1\s,.\-]+$/)]]
    });
  }

  private loadGenders(): void {
    this.archiveService.listGenders().subscribe({
      next: (data: any) => this.genders = data,
      error: (err) => console.error('Error al cargar géneros:', err)
    });
  }

  // Validación simplificada
  private validateForm(): string[] {
    const missingFields: string[] = [];

    if (!this.archive_number.trim()) missingFields.push(this.translate.instant('ARCHIVE_NUMBER'));
    if (!this.name.trim()) missingFields.push(this.translate.instant('FIRST_NAME'));
    if (!this.last_name_father.trim()) missingFields.push(this.translate.instant('FATHER_LAST_NAME'));
    if (!this.last_name_mother.trim()) missingFields.push(this.translate.instant('MOTHER_LAST_NAME'));
    if (!this.age || this.age <= 0) missingFields.push(this.translate.instant('AGE'));
    if (!this.gender_id) missingFields.push(this.translate.instant('GENDER'));
    if (!this.admission_date) missingFields.push(this.translate.instant('ADMISSION_DATE'));
    if (!this.location.trim()) missingFields.push(this.translate.instant('LOCATION'));

    return missingFields;
  }

  // Validaciones en tiempo real para inputs
  onNameKeyPress(event: KeyboardEvent): boolean {
    const pattern = /^[A-Za-zÀ-ÿ\u00f1\u00d1\s]$/;
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    return pattern.test(event.key) || allowedKeys.includes(event.key);
  }

  onAgeKeyPress(event: KeyboardEvent): boolean {
    const pattern = /^[0-9]$/;
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    return pattern.test(event.key) || allowedKeys.includes(event.key);
  }

  onArchiveNumberKeyPress(event: KeyboardEvent): boolean {
    const pattern = /^[A-Za-z0-9\-_]$/;
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    return pattern.test(event.key) || allowedKeys.includes(event.key);
  }

  onLocationKeyPress(event: KeyboardEvent): boolean {
    const pattern = /^[A-Za-zÀ-ÿ\u00f1\u00d1\s,.\-]$/;
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    return pattern.test(event.key) || allowedKeys.includes(event.key);
  }

  save(): void {
    this.submitted = true;
    this.text_validation = '';
    this.text_success = '';

    const missingFields = this.validateForm();

    if (missingFields.length > 0) {
      const plural = missingFields.length > 1;
      const campos = missingFields.join(', ');
      this.text_validation = this.translate.instant('Faltan algunos datos', {
        plural: plural ? 'n' : '',
        sPlural: plural ? 's' : '',
        campos
      });
      return;
    }

    const formData: ArchiveFormData = {
      archive_number: this.archive_number.trim(),
      name: this.name.trim(),
      last_name_father: this.last_name_father.trim(),
      last_name_mother: this.last_name_mother.trim(),
      age: this.age,
      gender_id: this.gender_id,
      address: this.address.trim(),
      admission_date: this.admission_date,
      location_name: this.location.trim()  // Enviar como texto plano
    };

    this.archiveService.registerArchive(formData).subscribe({
      next: (response) => {
        this.text_success = '✅ Paciente registrado exitosamente. Recargando formulario...';
        console.log('✅ Registro exitoso:', response);
        
        // Reset form inmediatamente para mostrar el formulario limpio
        this.resetForm();
        
        setTimeout(() => {
          // Recargar la misma página en lugar de redirigir
          window.location.reload();
        }, 1500);
      },
      error: (err) => {
        console.error('❌ Error al registrar archivo:', err);
        
        // Mejorar manejo de errores específicos
        if (err.status === 422 && err.error?.errors?.archive_number) {
          // Error de validación específico para número de expediente duplicado
          this.text_validation = err.error.errors.archive_number[0];
        } else if (err.error?.message) {
          // Mensaje de error del servidor
          this.text_validation = err.error.message;
        } else if (err.status === 500) {
          // Error 500 del servidor
          this.text_validation = 'Error interno del servidor. Por favor, verifique que el número de expediente no esté duplicado.';
        } else {
          // Error genérico
          this.text_validation = 'Ocurrió un error al registrar el paciente. Por favor, inténtelo nuevamente.';
        }
      }
    });
  }

  private resetForm(): void {
    this.archive_number = '';
    this.name = '';
    this.last_name_father = '';
    this.last_name_mother = '';
    this.age = null;
    this.gender_id = '';
    this.address = '';
    this.location = '';
    this.admission_date = new Date().toISOString().split('T')[0];
    this.submitted = false;
    this.text_validation = '';
    this.text_success = '';
    
    // Resetear el formulario reactivo también
    this.archiveForm.reset();
    this.initializeForm();
  }
}