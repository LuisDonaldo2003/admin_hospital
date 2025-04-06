import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DepartamentMService } from '../service/departament-m.service';

@Component({
  selector: 'app-add-departament-m',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './add-departament-m.component.html',
  styleUrl: './add-departament-m.component.scss'
})
export class AddDepartamentMComponent {

  name:string = '';
  valid_form: boolean = false;
  valid_form_success: boolean = false;
  text_validation:any = null;
  constructor(
    public departamentService: DepartamentMService,
  ) {

  }
  ngOnInit(): void {}

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
    this.departamentService.storeDepartament(data).subscribe((resp:any) => {
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
