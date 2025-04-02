import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpecialitieService } from '../service/specialitie.service';

@Component({
  selector: 'app-add-specialitie',
  imports: [FormsModule],
  templateUrl: './add-specialitie.component.html',
  styleUrl: './add-specialitie.component.scss'
})
export class AddSpecialitieComponent {

  name:string = '';
  valid_form: boolean = false;
  valid_form_success: boolean = false;
  text_validation:any = null;
  constructor(
    public specialitieService: SpecialitieService,
  ) {
    
  }
  ngOnInit(): void {

  }

  save(){
    this.valid_form = false;
    if(!this.name){
      this.valid_form = true;
      return;
    }
    let data = {
      name: this.name,
    };
    this.valid_form_success = false;
    this.text_validation = null;
    this.specialitieService.storeSpecialities(data).subscribe((resp:any) => {
      console.log(resp);
      if(resp.message == 403){
        this.text_validation = resp.message_text;
      }else{
        this.name = '';
        this.valid_form_success = true;
      }

    })
  }

}

