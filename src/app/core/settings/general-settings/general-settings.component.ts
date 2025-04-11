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
  public borderColor: string = '#ff0000'; // Color inicial del borde

  constructor(private dataService: DataService) {
    this.dataService.darkMode$.subscribe(mode => {
      this.isDarkMode = mode;
      this.updateBorderColor(); // Aplica color cada vez que cambia el modo
    });
  }

  toggleTheme(): void {
    this.dataService.toggleDarkMode();
    this.updateBorderColor(); // Vuelve a aplicar el color
  }

  updateBorderColor(): void {
    if (this.isDarkMode) {
      document.body.style.setProperty('--user-border-color', this.borderColor);
    }
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
