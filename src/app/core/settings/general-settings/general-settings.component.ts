import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataService } from 'src/app/shared/data/data.service';
import { routes } from 'src/app/shared/routes/routes';

interface data {
  value: string;
}

@Component({
  selector: 'app-general-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent {
  public routes = routes;
  public isDarkMode = false;
  public borderColor: string = '#ff0000';
  public selectedLang: string;

  constructor(
    private dataService: DataService,
    private translate: TranslateService
  ) {
    // Dark mode
    const savedColor = localStorage.getItem('borderColor');
    if (savedColor) {
      this.borderColor = savedColor;
      this.updateBorderColor();
    }

    this.dataService.darkMode$.subscribe(mode => {
      this.isDarkMode = mode;
      this.updateBorderColor();
    });

    // Language
    this.selectedLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLang);
  }

  toggleTheme(): void {
    this.dataService.toggleDarkMode();
    localStorage.setItem('darkMode', String(this.isDarkMode));
    this.updateBorderColor();
  }

  updateBorderColor(): void {
    document.documentElement.style.setProperty('--user-border-color', this.borderColor);
    localStorage.setItem('borderColor', this.borderColor);
  }

  toggleLanguage(): void {
    this.selectedLang = this.selectedLang === 'es' ? 'en' : 'es';
    this.translate.use(this.selectedLang);
    localStorage.setItem('language', this.selectedLang);
  }


  // (No estás usando estas listas, pero las dejo por si las usás luego)
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
