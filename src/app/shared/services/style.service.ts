import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StyleService {
  applyStoredVariables(): void {
    const color = localStorage.getItem('borderColor');
    if (color) {
      document.documentElement.style.setProperty('--user-border-color', color);
    }
  }
}
