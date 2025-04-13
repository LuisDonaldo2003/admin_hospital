import { Component, OnInit } from '@angular/core';
import { StyleService } from './shared/services/style.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit {
  title = 'preclinic-angular';

  constructor(
    private styleService: StyleService,
    private translate: TranslateService
  ) {
    const savedLang = localStorage.getItem('language') || 'en';
    this.translate.setDefaultLang(savedLang);
    this.translate.use(savedLang);
  }

  ngOnInit(): void {
    this.styleService.applyStoredVariables(); // ✅ Se aplica al cargar la app
  }
}
