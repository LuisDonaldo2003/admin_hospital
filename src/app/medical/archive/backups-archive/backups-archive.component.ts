import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import FileSaver from 'file-saver';
import { ArchiveService } from '../service/archive.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-backups-archive',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RouterModule],
  templateUrl: './backups-archive.component.html',
  styleUrls: ['./backups-archive.component.scss']
})
export class BackupsArchiveComponent implements OnInit {
  backups: any[] = [];

  constructor(private archiveService: ArchiveService) {}

  ngOnInit(): void {
    this.loadBackups();
  }

  loadBackups(): void {
    this.archiveService.listBackups().subscribe({
      next: (res: any) => this.backups = res.data,
      error: err => console.error('Error cargando respaldos:', err)
    });
  }

  downloadBackup(filename: string): void {
    this.archiveService.downloadBackup(filename).subscribe(blob => {
      FileSaver.saveAs(blob, filename);
    });
  }
}
