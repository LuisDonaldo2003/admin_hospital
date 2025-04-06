import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DepartamentMService } from '../service/departament-m.service';

@Component({
  selector: 'app-edit-departament-m',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    RouterModule
  ],
  templateUrl: './edit-departament-m.component.html',
  styleUrl: './edit-departament-m.component.scss'
})
export class EditDepartamentMComponent {
  name:string = '';
  state:number = 1;
  valid_form: boolean = false;
  valid_form_success: boolean = false;
  text_validation:any = null;

  departament_id:any;
  constructor(
    public departamentService: DepartamentMService,
    public activedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.activedRoute.params.subscribe((resp:any) => {
      this.departament_id = resp.id;
    })
    this.showDepartament();
  }

  showDepartament(){
    this.departamentService.showDepartament(this.departament_id).subscribe((resp:any) => {
      console.log(resp);
      this.name = resp.name;
      this.state = resp.state;
    })
  }

  save(){
    this.valid_form = false;
    if(!this.name){
      this.valid_form = true;
      return;
    }
    let data = {
      name: this.name,
      state: this.state,
    };
    this.valid_form_success = false;
    this.text_validation = null;
    this.departamentService.editDepartament(data, this.departament_id).subscribe((resp:any) => {
      console.log(resp);
      if(resp.message == 403){
        this.text_validation = resp.message_text;
        return ;
      }
      this.valid_form_success = true;
    })
  }
}
