import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArchiveComponent } from './archive.component';
import { AddArchiveComponent } from './add-archive/add-archive.component';
import { ListArchiveComponent } from './list-archive/list-archive.component';
import { EditArchiveComponent } from './edit-archive/edit-archive.component';
import { ExportArchiveComponent } from './export-archive/export-archive.component';
import { BackupsArchiveComponent } from './backups-archive/backups-archive.component';

const routes: Routes = [
  {
    path: '',
    component: ArchiveComponent,
    children: [
      {
        path: 'add_archive',
        component: AddArchiveComponent
      },
      {
        path: 'list_archive',
        component: ListArchiveComponent
      },
      {
        path: 'export_archive',
        component: ExportArchiveComponent
      },
      {
        path: 'backup_archive',
        component: BackupsArchiveComponent
      },
      {
        path: 'list_archive/edit_archive/:id',
        component: EditArchiveComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArchiveRoutingModule {}
