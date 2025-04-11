import { Component } from '@angular/core';
import { DataService } from 'src/app/shared/data/data.service'; // 💡 Asegúrate de importar

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

  constructor(private dataService: DataService) {
    this.dataService.darkMode$.subscribe(mode => {
      this.isDarkMode = mode;
    });
  }

  toggleTheme(): void {
    this.dataService.toggleDarkMode();
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
