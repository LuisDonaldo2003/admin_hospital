import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './shared/auth/auth.service'; // <-- Importa tu AuthService
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'preclinic-angular';
  private authSubscription: Subscription | undefined;

  constructor(
    private translate: TranslateService,
    private authService: AuthService // <-- Inyecta AuthService
  ) {
    const savedLang = localStorage.getItem('language') || 'en';
    this.translate.setDefaultLang(savedLang);
    this.translate.use(savedLang);
  }

  ngOnInit(): void {
    // Suscríbete al estado de autenticación
    this.authSubscription = this.authService.user$.subscribe(user => {
      // Aquí puedes manejar el estado de autenticación del usuario si es necesario
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }
}
