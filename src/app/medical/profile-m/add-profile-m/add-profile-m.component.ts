import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProfileMService } from '../service/profile-m.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-add-profile-m',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './add-profile-m.component.html',
  styleUrl: './add-profile-m.component.scss'
})
export class AddProfileMComponent {

  name: string = '';
  valid_form: boolean = false;
  valid_form_success: boolean = false;
  text_validation: any = null;

  constructor(
    public profileService: ProfileMService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {}

  save() {
    this.valid_form = false;
    if (!this.name) {
      this.valid_form = true;
      return;
    }
    let data = {
      name: this.name,
    };
    this.valid_form_success = false;
    this.text_validation = null;
    this.profileService.storeProfile(data).subscribe((resp: any) => {
      if (resp.message == 403) {
        this.text_validation = resp.message_text;
      } else {
        this.name = '';
        this.valid_form_success = true;
      }
    })
  }
}
