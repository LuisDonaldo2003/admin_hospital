import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProfileMService } from '../service/profile-m.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-edit-profile-m',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './edit-profile-m.component.html',
  styleUrl: './edit-profile-m.component.scss'
})
export class EditProfileMComponent {

  name: string = '';
  state: number = 1;
  valid_form: boolean = false;
  valid_form_success: boolean = false;
  text_validation: any = null;

  profile_id: any;
  constructor(
    public profileService: ProfileMService,
    public activedRoute: ActivatedRoute,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.activedRoute.params.subscribe((resp: any) => {
      this.profile_id = resp.id;
    })
    this.showProfile();
  }

  showProfile() {
    this.profileService.showProfile(this.profile_id).subscribe((resp: any) => {
      this.name = resp.name;
      this.state = resp.state;
    })
  }

  save() {
    this.valid_form = false;
    if (!this.name) {
      this.valid_form = true;
      return;
    }
    let data = {
      name: this.name,
      state: this.state,
    };
    this.valid_form_success = false;
    this.text_validation = null;
    this.profileService.editProfile(data, this.profile_id).subscribe((resp: any) => {
      if (resp.message == 403) {
        this.text_validation = resp.message_text;
        return;
      }
      this.valid_form_success = true;
    })
  }
}
