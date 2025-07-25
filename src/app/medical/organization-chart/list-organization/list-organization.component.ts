import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationService, OrganizationUser } from '../service/organization.service';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { interval, Subscription } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-list-organization',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './list-organization.component.html',
  styleUrls: ['./list-organization.component.scss']
})
export class ListOrganizationComponent implements OnInit, OnDestroy {
  users: OrganizationUser[] = [];
  loading = true;
  rolesMap: { [role: string]: OrganizationUser[] } = {};
  private pollingSubscription: Subscription | undefined;
  public selectedLang: string;

  constructor(
    private organizationService: OrganizationService,
    private authService: AuthService,
    private translate: TranslateService
  ) {
    this.selectedLang = localStorage.getItem('language') || 'es';
    this.translate.use(this.selectedLang);
  }
  toggleLanguage(): void {
    this.selectedLang = this.selectedLang === 'es' ? 'en' : 'es';
    this.translate.use(this.selectedLang);
    localStorage.setItem('language', this.selectedLang);
  }

  ngOnInit(): void {
    this.loadUsers();
    // Polling cada 10 segundos
    this.pollingSubscription = interval(10000).subscribe(() => this.loadUsers());
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }

  loadUsers() {
    this.organizationService.listUsers().subscribe({
      next: (resp: any) => {
        this.users = resp.users.map((u: any) => ({
          ...u,
          online: u.online === true // fuerza booleano
        }));
        this.groupUsersByRole();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  groupUsersByRole() {
    this.rolesMap = {};
    this.users.forEach(user => {
      user.roles.forEach(role => {
        if (!this.rolesMap[role.name]) {
          this.rolesMap[role.name] = [];
        }
        this.rolesMap[role.name].push(user);
      });
    });
  }
}
