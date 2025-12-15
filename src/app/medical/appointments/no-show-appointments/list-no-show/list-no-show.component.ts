import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { AppointmentsService } from '../../service/appointments.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PermissionService } from 'src/app/shared/services/permission.service';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Component({
  selector: 'app-list-no-show',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './list-no-show.component.html',
  styleUrls: ['./list-no-show.component.scss']
})
export class ListNoShowComponent implements OnInit {
  public appointmentList: any[] = [];
  dataSource!: MatTableDataSource<any>;

  public showFilter = false;
  public searchDataValue = '';
  public lastIndex = 0;
  public pageSize = 20;
  public totalData = 0;
  public skip = 0;
  public limit: number = this.pageSize;
  public pageIndex = 0;
  public serialNumberArray: Array<number> = [];
  public currentPage = 1;
  public pageNumberArray: Array<number> = [];
  public pageSelection: Array<any> = [];
  public totalPages = 0;

  public appointment_generals: any[] = [];
  public appointment_selected: any = null;

  constructor(
    public appointmentsService: AppointmentsService,
    private translate: TranslateService,
    public permissionService: PermissionService,
    private driverTourService: DriverTourService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.getTableData();
    this.checkAndStartTour();
  }

  private checkAndStartTour(): void {
    setTimeout(() => {
      if (!this.driverTourService.isTourCompleted('no-show-appointments')) {
        this.startTour();
      }
    }, 500);
  }

  startTour(): void {
    this.driverTourService.startNoShowAppointmentsTour();
  }

  private getTableData(): void {
    this.appointmentList = [];
    this.serialNumberArray = [];

    // Filtrar solo citas no asistidas
    this.appointmentsService.listAppointments({ estado: 'no_asistio' }).subscribe({
      next: (resp: any) => {
        let data = resp.data || [];

        // Filtrado estricto por permisos
        const canSpecialist = this.authService.hasPermission('appointments_add_especialidad');
        const canGeneral = this.authService.hasPermission('appointments_add_general_medical');

        if (canSpecialist && !canGeneral) {
          data = data.filter((item: any) => {
            const doc = item.doctor_relation || item.doctor;
            return doc && doc.especialidad_id;
          });
        } else if (canGeneral && !canSpecialist) {
          data = data.filter((item: any) => {
            const doc = item.doctor_relation || item.doctor;
            return doc && doc.general_medical_id;
          });
        }

        this.totalData = data.length;
        this.appointment_generals = data;
        this.getTableDataGeneral();
      },
      error: (error: any) => {
        console.error('Error loading no-show appointments:', error);
      }
    });
  }

  getTableDataGeneral() {
    this.appointmentList = [];
    this.serialNumberArray = [];

    this.appointment_generals.map((res: any, index: number) => {
      const serialNumber = index + 1;
      if (index >= this.skip && serialNumber <= this.limit) {
        this.appointmentList.push(res);
        this.serialNumberArray.push(serialNumber);
      }
    });

    this.dataSource = new MatTableDataSource<any>(this.appointmentList);
    this.calculateTotalPages(this.totalData, this.pageSize);
  }

  searchData(value: string): void {
    this.searchDataValue = value;
    if (!value) {
      this.getTableData();
      return;
    }

    const lowerValue = value.toLowerCase();
    this.appointmentList = this.appointment_generals.filter((item: any) => {
      return (
        item.paciente_nombre?.toLowerCase().includes(lowerValue) ||
        item.doctor?.nombre?.toLowerCase().includes(lowerValue) ||
        item.motivo?.toLowerCase().includes(lowerValue)
      );
    });

    this.dataSource = new MatTableDataSource<any>(this.appointmentList);
    this.totalData = this.appointmentList.length;
    this.calculateTotalPages(this.totalData, this.pageSize);
  }

  sortData(sort: any) {
    const data = this.appointmentList.slice();
    if (!sort.active || sort.direction === '') {
      this.appointmentList = data;
    } else {
      this.appointmentList = data.sort((a: any, b: any) => {
        const aValue = (a as any)[sort.active];
        const bValue = (b as any)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }

  getMoreData(event: string): void {
    if (event === 'next') {
      this.currentPage++;
      this.pageIndex = this.currentPage - 1;
      this.limit += this.pageSize;
      this.skip = this.pageSize * this.pageIndex;
      this.getTableDataGeneral();
    } else if (event === 'previous') {
      this.currentPage--;
      this.pageIndex = this.currentPage - 1;
      this.limit -= this.pageSize;
      this.skip = this.pageSize * this.pageIndex;
      this.getTableDataGeneral();
    }
  }

  moveToPage(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.skip = this.pageSelection[pageNumber - 1].skip;
    this.limit = this.pageSelection[pageNumber - 1].limit;
    if (pageNumber > this.currentPage) {
      this.pageIndex = pageNumber - 1;
    } else if (pageNumber < this.currentPage) {
      this.pageIndex = pageNumber + 1;
    }
    this.getTableDataGeneral();
  }

  PageSize(): void {
    this.pageSelection = [];
    this.limit = this.pageSize;
    this.skip = 0;
    this.currentPage = 1;
    this.getTableDataGeneral();
  }

  private calculateTotalPages(totalData: number, pageSize: number): void {
    this.pageNumberArray = [];
    this.totalPages = totalData / pageSize;
    if (this.totalPages % 1 !== 0) {
      this.totalPages = Math.trunc(this.totalPages + 1);
    }
    for (let i = 1; i <= this.totalPages; i++) {
      const limit = pageSize * i;
      const skip = limit - pageSize;
      this.pageNumberArray.push(i);
      this.pageSelection.push({ skip: skip, limit: limit });
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPacienteNombre(appointment: any): string {
    return appointment.paciente_nombre || appointment.paciente?.nombre || 'Sin nombre';
  }

  getDoctorNombre(appointment: any): string {
    return appointment.doctor?.nombre || 'Sin doctor';
  }

  selectAppointment(appointment: any): void {
    this.appointment_selected = appointment;
  }

  deleteAppointment(): void {
    if (!this.appointment_selected) return;

    this.appointmentsService.deleteAppointment(this.appointment_selected.id).subscribe({
      next: (resp: any) => {
        if (resp.success) {
          this.appointment_generals = this.appointment_generals.filter(
            (item: any) => item.id !== this.appointment_selected!.id
          );
          this.getTableData();
          this.appointment_selected = null;
        }
      },
      error: (error: any) => {
        console.error('Error deleting appointment:', error);
      }
    });
  }

  canViewAppointment(): boolean {
    return this.permissionService.hasPermission('list_appointments');
  }
}
