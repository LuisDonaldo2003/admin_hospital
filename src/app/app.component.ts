import { Component, OnInit } from '@angular/core';
import { StyleService } from './shared/services/style.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit {
  title = 'preclinic-angular';

  constructor(private styleService: StyleService) {}

  ngOnInit(): void {
    this.styleService.applyStoredVariables(); // ✅ Se aplica al cargar la app
  }
}
