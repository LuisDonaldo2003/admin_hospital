import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArchiveService } from './service/archive.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss']
})
export class ArchiveComponent implements OnInit {

  archives: any[] = [];

  constructor(private archiveService: ArchiveService) {}

  ngOnInit(): void {
    this.getArchives();
  }

  getArchives(): void {
    this.archiveService.listArchives().subscribe({
      next: (res: any) => this.archives = res.archives ?? res, // ajusta según la estructura de respuesta
      error: (err) => console.error(err)
    });
  }
}
