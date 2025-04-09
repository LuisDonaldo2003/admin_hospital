import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileMComponent } from './profile-m.component';
import { AddProfileMComponent } from './add-profile-m/add-profile-m.component';
import { ListProfileMComponent } from './list-profile-m/list-profile-m.component';
import { EditProfileMComponent } from './edit-profile-m/edit-profile-m.component';

const routes: Routes = [{
  path:'',
  component: ProfileMComponent,
  children:[
    {
      path: 'add_profile-m',
      component: AddProfileMComponent
    },
    {
      path: 'list_profile-m',
      component: ListProfileMComponent
    },
    {
      path: 'list_profile-m/edit_profile-m/:id',
      component: EditProfileMComponent
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileMRoutingModule { }
