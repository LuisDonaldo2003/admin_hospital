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
  public routes = routes;
  public isDarkMode = false;
  public borderColor: string = '#ff0000';
  public cardBgColorLight: string = '#fffbe8'; // default for light mode
  public cardBgColorDark: string = '#23221c'; // default for dark mode
  public selectedLang: string;

  constructor(
    private dataService: DataService,
    private translate: TranslateService
  ) {
    // Load saved border color
    const savedColor = localStorage.getItem('borderColor');
    if (savedColor) {
      this.borderColor = savedColor;
      this.updateBorderColor();
    }
    // Load saved card backgrounds
    const savedCardBgLight = localStorage.getItem('cardBgColorLight');
    if (savedCardBgLight) {
      this.cardBgColorLight = savedCardBgLight;
    }
    const savedCardBgDark = localStorage.getItem('cardBgColorDark');
    if (savedCardBgDark) {
      this.cardBgColorDark = savedCardBgDark;
    }
    this.selectedLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLang);
  }

  ngOnInit(): void {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    this.isDarkMode = savedMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    }
    this.applyCardBgColor();
    this.dataService.darkMode$.subscribe(mode => {
      this.isDarkMode = mode;
      if (mode) {
        document.body.classList.add('dark-mode');
        document.body.style.setProperty('--user-card-bg', this.cardBgColorDark);
      } else {
        document.body.classList.remove('dark-mode');
        document.body.style.setProperty('--user-card-bg', this.cardBgColorLight);
      }
      this.updateBorderColor();
      this.applyCardBgColor();
    });
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.dataService.toggleDarkMode();
    localStorage.setItem('darkMode', String(this.isDarkMode));
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    this.updateBorderColor();
    this.applyCardBgColor();
  }

  updateBorderColor(): void {
    document.documentElement.style.setProperty('--user-border-color', this.borderColor);
    document.body.style.setProperty('--user-border-color', this.borderColor);
    localStorage.setItem('borderColor', this.borderColor);
    // Si tienes un servicio de estilos, notifícalo aquí si es necesario
  }

  // Calcula el color de texto ideal (negro o blanco) según el fondo
  private getContrastYIQ(hexcolor: string): string {
    // Elimina el # si existe
    hexcolor = hexcolor.replace('#', '');
    // Convierte a RGB
    const r = parseInt(hexcolor.substr(0,2),16);
    const g = parseInt(hexcolor.substr(2,2),16);
    const b = parseInt(hexcolor.substr(4,2),16);
    // Calcula el contraste
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
  }

  updateCardBgColorLight(): void {
    document.body.style.setProperty('--user-card-bg', this.cardBgColorLight);
    document.documentElement.style.setProperty('--user-card-bg', this.cardBgColorLight);
    localStorage.setItem('cardBgColorLight', this.cardBgColorLight);
    const textColor = this.getContrastYIQ(this.cardBgColorLight);
    document.body.style.setProperty('--user-card-text-color', textColor);
    document.documentElement.style.setProperty('--user-card-text-color', textColor);
    localStorage.setItem('cardTextColorLight', textColor);
    if (!this.isDarkMode) {
      this.applyCardBgColor();
    }
  }

  updateCardBgColorDark(): void {
    document.body.style.setProperty('--user-card-bg', this.cardBgColorDark);
    document.documentElement.style.setProperty('--user-card-bg', this.cardBgColorDark);
    localStorage.setItem('cardBgColorDark', this.cardBgColorDark);
    const textColor = this.getContrastYIQ(this.cardBgColorDark);
    document.body.style.setProperty('--user-card-text-color', textColor);
    document.documentElement.style.setProperty('--user-card-text-color', textColor);
    localStorage.setItem('cardTextColorDark', textColor);
    if (this.isDarkMode) {
      this.applyCardBgColor();
    }
  }

  applyCardBgColor(): void {
    if (this.isDarkMode) {
      document.body.style.setProperty('--user-card-bg', this.cardBgColorDark);
      document.documentElement.style.setProperty('--user-card-bg', this.cardBgColorDark);
      const textColor = localStorage.getItem('cardTextColorDark') || this.getContrastYIQ(this.cardBgColorDark);
      document.body.style.setProperty('--user-card-text-color', textColor);
      document.documentElement.style.setProperty('--user-card-text-color', textColor);
    } else {
      document.body.style.setProperty('--user-card-bg', this.cardBgColorLight);
      document.documentElement.style.setProperty('--user-card-bg', this.cardBgColorLight);
      const textColor = localStorage.getItem('cardTextColorLight') || this.getContrastYIQ(this.cardBgColorLight);
      document.body.style.setProperty('--user-card-text-color', textColor);
      document.documentElement.style.setProperty('--user-card-text-color', textColor);
    }
  }

  toggleLanguage(): void {
    this.selectedLang = this.selectedLang === 'es' ? 'en' : 'es';
    this.translate.use(this.selectedLang);
    localStorage.setItem('language', this.selectedLang);
  }

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

  // Devuelve la clase para el botón según el contraste del color recibido
  getBorderBtnClass(color: string): string {
    if (!color) return '';
    // Si el color es muy claro, usa clase especial para texto oscuro
    const hex = color.replace('#', '');
    if (hex.length !== 6) return '';
    const r = parseInt(hex.substr(0,2),16);
    const g = parseInt(hex.substr(2,2),16);
    const b = parseInt(hex.substr(4,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return yiq >= 200 ? 'light-border' : '';
  }
}