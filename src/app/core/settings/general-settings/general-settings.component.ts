// Importación de módulos y servicios necesarios para el componente
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataService } from 'src/app/shared/data/data.service';
import { routes } from 'src/app/shared/routes/routes';

// Definición de una interfaz para manejar listas de datos
interface data {
  value: string;
}

@Component({
  selector: 'app-general-settings',
  standalone: true,
  imports: [
    CommonModule, // Módulo común de Angular
    FormsModule,  // Módulo para formularios
    RouterModule, // Módulo para manejo de rutas
    TranslateModule // Módulo para traducciones
  ],
  templateUrl: './general-settings.component.html', // Ruta del archivo HTML asociado
  styleUrls: ['./general-settings.component.scss'] // Ruta del archivo de estilos asociado
})
export class GeneralSettingsComponent implements OnInit {
  public routes = routes; // Rutas compartidas para navegación
  public isDarkMode = false; // Estado del modo oscuro
  public borderColor: string = '#ff0000'; // Color de borde predeterminado
  public selectedLang: string; // Idioma seleccionado

  constructor(
    private dataService: DataService, // Servicio para manejar datos compartidos
    private translate: TranslateService // Servicio para manejar traducciones
  ) {
    // Recupera el color de borde guardado en localStorage y lo aplica
    const savedColor = localStorage.getItem('borderColor');
    if (savedColor) {
      this.borderColor = savedColor;
      this.updateBorderColor();
    }

    // Recupera el idioma guardado en localStorage y lo establece
    this.selectedLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLang);
  }

  ngOnInit(): void {
    // Recupera el estado del modo oscuro guardado en localStorage y lo aplica
    const savedMode = localStorage.getItem('darkMode') === 'true';
    this.isDarkMode = savedMode;

    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    }

    // Se suscribe a cambios en el modo oscuro desde el servicio de datos
    this.dataService.darkMode$.subscribe(mode => {
      this.isDarkMode = mode;
      if (mode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      this.updateBorderColor(); // Actualiza el color de borde según el modo
    });
  }

  // Alterna entre modo oscuro y claro
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.dataService.toggleDarkMode(); // Notifica el cambio al observable
    localStorage.setItem('darkMode', String(this.isDarkMode)); // Guarda el estado en localStorage

    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    this.updateBorderColor(); // Actualiza el color de borde
  }

  // Actualiza el color de borde en el DOM y lo guarda en localStorage
  updateBorderColor(): void {
    document.documentElement.style.setProperty('--user-border-color', this.borderColor);
    localStorage.setItem('borderColor', this.borderColor);
  }

  // Alterna entre los idiomas inglés y español
  toggleLanguage(): void {
    this.selectedLang = this.selectedLang === 'es' ? 'en' : 'es';
    this.translate.use(this.selectedLang); // Cambia el idioma en el servicio de traducción
    localStorage.setItem('language', this.selectedLang); // Guarda el idioma seleccionado en localStorage
  }

  // Listas de datos para selección en la interfaz
  selectedList1: data[] = [
    { value: 'Select' },
    { value: 'California' },
    { value: 'Tasmania' },
    { value: 'Auckland' },
    { value: 'Marlborough' }
  ];

  selectedList2: data[] = [
    { value: 'India' },
    { value: 'London' },
    { value: 'France' },
    { value: 'USA' }
  ];
}