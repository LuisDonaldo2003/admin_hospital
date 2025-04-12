import { Component } from '@angular/core';
import { DataService } from 'src/app/shared/data/data.service';
import { routes } from 'src/app/shared/routes/routes';

interface data {
  value: string;
}

@Component({
  selector: 'app-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss'],
  standalone: false
})
export class GeneralSettingsComponent {
  public routes = routes;
  public deleteIcon1 = true;
  public deleteIcon2 = true;
  public selectedValue!: string;

  public isDarkMode = false;
  public borderColor: string = '#ff0000'; // Color inicial

  constructor(private dataService: DataService) {
    const savedColor = localStorage.getItem('borderColor');
    if (savedColor) {
      this.borderColor = savedColor;
      this.updateBorderColor();
    }

    this.dataService.darkMode$.subscribe(mode => {
      this.isDarkMode = mode;
      this.updateBorderColor();
    });
  }

  toggleTheme(): void {
    this.dataService.toggleDarkMode();
    localStorage.setItem('darkMode', String(this.isDarkMode)); // ✅ Guarda el valor
    this.updateBorderColor();
  }


  updateBorderColor(): void {
    document.documentElement.style.setProperty('--user-border-color', this.borderColor);
    localStorage.setItem('borderColor', this.borderColor);
  }

  deleteIconFunc1() {
    this.deleteIcon1 = !this.deleteIcon1;
  }

  deleteIconFunc2() {
    this.deleteIcon2 = !this.deleteIcon2;
  }

  selectedList1: data[] = [
    { value: 'Select' },
    { value: 'California' },
    { value: 'Tasmania' },
    { value: 'Auckland' },
    { value: 'Marlborough' },
  ];

  selectedList2: data[] = [
    { value: 'India' },
    { value: 'London' },
    { value: 'France' },
    { value: 'USA' },
  ];
}
