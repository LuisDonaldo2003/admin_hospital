import { Component } from '@angular/core';

@Component({
  selector: 'app-credits',
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.scss'],
  standalone: false
})
export class CreditsComponent {
  public currentYear: number = new Date().getFullYear();
  // Información de créditos del sistema
  public teamMembers = [
    {
      name: 'Equipo de Desarrollo',
      role: 'Desarrolladores Principales',
      description: 'Desarrolladores encargados del diseño y implementación del sistema hospitalario SISMEG.',
      avatar: 'assets/img/profiles/avatar-dev.jpg'
    }
  ];

  public technologies = [
    {
      name: 'Angular',
      description: 'Framework principal para el desarrollo del frontend',
      version: '16.x',
      icon: 'fab fa-angular'
    },
    {
      name: 'Laravel',
      description: 'Framework PHP para el desarrollo del backend API',
      version: '10.x',
      icon: 'fab fa-laravel'
    },
    {
      name: 'Bootstrap',
      description: 'Framework CSS para el diseño responsivo',
      version: '5.x',
      icon: 'fab fa-bootstrap'
    },
    {
      name: 'MySQL',
      description: 'Sistema de gestión de base de datos',
      version: '8.x',
      icon: 'fas fa-database'
    }
  ];

  public systemInfo = {
    name: 'SISMEG',
    fullName: 'Sistema de Información y Gestión Médica del Estado de Guerrero',
    version: '1.0.0',
    releaseDate: '2024',
    description: 'Sistema integral para la gestión hospitalaria desarrollado específicamente para mejorar la eficiencia y calidad de la atención médica.'
  };

  constructor() { }
}
