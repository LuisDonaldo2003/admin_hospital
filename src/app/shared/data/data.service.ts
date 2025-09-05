import { Injectable } from '@angular/core';
import { routes } from '../routes/routes';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { apiResultFormat } from '../models/models';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {

  //Modo Oscuro
  private darkModeSubject = new BehaviorSubject<boolean>(this.getInitialDarkMode());
  public darkMode$ = this.darkModeSubject.asObservable();

  constructor(
    private http: HttpClient,
    private translate: TranslateService
) {
    // Aplicar el modo oscuro al cargar
    if (this.darkModeSubject.value) {
      document.body.classList.add('dark-mode');
    }
  }

  toggleDarkMode(): void {
    const current = this.darkModeSubject.value;
    const newValue = !current;
    this.darkModeSubject.next(newValue);
    localStorage.setItem('dark-mode', newValue ? 'true' : 'false');

    if (newValue) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  private getInitialDarkMode(): boolean {
    return localStorage.getItem('dark-mode') === 'true';
  }


  //FIN Modo Oscuro
  public getDoctorsList(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/doctors-list.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }

  public showTranslatedMessage(): void {
  const message = this.translate.instant('USER_REGISTRATION');
  alert(message); // mostrará "User Registration" o "Registro de Usuario"
}

  public getPatientsList(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/doctors-list.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getStaffList(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/staff-list.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getAppointmentList(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/appointment-list.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getStaffHoliday(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/staff-holiday.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getSchedule(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/schedule.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getInvoices(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/invoices.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getPayments(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/payments.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getExpenses(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/expenses.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getTaxes(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/taxes.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getProvidentFund(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/provident-fund.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getDepartmentList(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/department-list.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getSalary(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/salary.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getAssetsList(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/assets-list.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getExpenseReports(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/expense-reports.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getInvoiceReports(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/invoice-reports.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getAllInvoice(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/all-invoice.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getPatientDashboard(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/patient-dashboard.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getInvoicesPaid(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/invoices-paid.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getInvoicesOverdue(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/invoices-overdue.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getInvoicesDraft(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/invoices-draft.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getInvoicesCancelled(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/invoices-cancelled.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getInvoicesRecurring(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/invoices-recurring.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getStaffLeave(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/staff-leave.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getEvents() {
    return this.http.get<apiResultFormat>('assets/json/scheduleevents.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public getDataTables() {
    return this.http.get<apiResultFormat>('assets/json/data-tables.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }
  public sideBar = [
    {
      tittle: 'SIDEBAR_MAIN',
      showAsTab: false,
      separateRoute: false,
      menu: [
        {
          menuValue: 'SIDEBAR',
          group: 'GRUPO_TABLERO',
          hasSubRoute: true,
          showSubRoute: false,
          base: 'dashboard',
          route:'dashboard',
          icon: 'fas fa-th-large',
          faIcon: true,
          subMenus: [
            {
              menuValue: 'ADMIN',
              route: routes.adminDashboard,
              base: routes.adminDashboard,
              permision: 'admin_dashboard',
              show_nav: true,
            },
            {
              menuValue: 'DOCTOR',
              route: routes.doctorDashboard,
              base: routes.doctorDashboard,
              permision: 'doctor_dashboard',
              show_nav: true,
            },
            {
              menuValue: 'PATIENT',
              route: routes.patientDashboard,
              base: routes.patientDashboard,
              permision: 'patient_dashboard',
              show_nav: true,
            },
            {
              menuValue: 'ARCHIVO',
              route: routes.archiveDashboard,
              base: routes.archiveDashboard,
              permision: 'archive_dashboard',
              show_nav: true,
            },
          ],
        },
        {
          menuValue: 'ROL',
          group: 'GRUPO_ADMINISTRADOR',
          hasSubRoute: true,
          showSubRoute: false,
          base: 'gallery',
          base2: 'profile',
          icon: 'fas fa-user-shield',
          faIcon: true,
          subMenus: [
            {
              menuValue: 'REGISTER',
              route: routes.registerRole,
              base: routes.registerRole,
              permision: 'register_rol',
              show_nav: true,
            },
            {
              menuValue: 'LIST',
              route: routes.listadoRole,
              base: routes.listadoRole,
              permision: 'list_rol',
              show_nav: true,
            },
            {
              menuValue: 'EDIT',
              route: '',
              base: '',
              permision: 'edit_rol',
              show_nav: false,
            },
            {
              menuValue: 'DELETE',
              route: '',
              base: '',
              permision: 'delete_rol',
              show_nav: false,
            },
          ],
        },
        {
          menuValue: 'USER',
          group: 'GRUPO_ADMINISTRADOR',
          hasSubRoute: true,
          showSubRoute: false,
          base: 'staffs',
          icon: 'fas fa-users',
          faIcon: true,
          subMenus: [
            {
              menuValue: 'LIST',
              route: routes.staffList,
              base: routes.staffList,
              permision: 'list_staff',
              show_nav: true,
            },
            {
              menuValue: 'ADD',
              route: routes.addStaff,
              base: routes.addStaff,
              permision: 'register_staff',
              show_nav: true,
            },
            {
              menuValue: 'EDIT',
              route: '',
              base: '',
              permision: 'edit_staff',
              show_nav: false,
            },
            {
              menuValue: 'DELETE',
              route: '',
              base: '',
              permision: 'delete_staff',
              show_nav: false,
            },
            // {
            //   menuValue: 'Attendance',
            //   route: routes.staffAttendance,
            //   base: routes.staffAttendance,
            // },
          ],
        },
        {
          menuValue: 'ORGANIZATION_CHART',
          group: 'GRUPO_ADMINISTRADOR',
          hasSubRoute: true,
          showSubRoute: false,
          base: 'staffs',
          icon: 'fas fa-users',
          faIcon: true,
          subMenus: [
            {
              menuValue: 'LIST',
              route: routes.listOrganization,
              base: routes.listOrganization,
              permision: 'list_organization',
              show_nav: true,
            },
          ],
        },
        {
          menuValue: 'PULSE_ACCESS',
          group: 'GRUPO_ADMINISTRADOR',
          hasSubRoute: true,
          showSubRoute: false,
          base: 'pulse-access',
          icon: 'fas fa-heartbeat',
          faIcon: true,
          subMenus: [
            {
              menuValue: 'DASHBOARD',
              route: 'http://sismeg.com/monitoring_dashboard_laravel',
              base: 'pulse-dashboard',
              permision: 'access_pulse',
              show_nav: true,
              external: true,
            },
          ],
        },
        {
          menuValue: 'CONTRACT',
          group: 'GRUPO_RH',
          hasSubRoute: true,
          showSubRoute: false,
          base: 'contract-types',
          icon: 'fas fa-file-contract',
          faIcon: true,
          subMenus: [
            {
              menuValue: 'LIST',
              route: routes.contractList,
              base: routes.contractList,
              permision: 'list_contract',
              show_nav: true,
            },
            {
              menuValue: 'ADD',
              route: routes.addContract,
              base: routes.addContract,
              permision: 'add_contract',
              show_nav: true,
            },
            {
              menuValue: 'EDIT',
              route: '',
              base: '',
              permision: 'edit_contract',
              show_nav: false,
            },
            {
              menuValue: 'DELETE',
              route: '',
              base: '',
              permision: 'delete_contract',
              show_nav: false,
            },
          ],
        },
        {
          menuValue: 'PROFILE',
          group: 'GRUPO_RH',
          hasSubRoute: true,
          showSubRoute: false,
          base: 'profile-m',
          icon: 'fas fa-id-badge',
          faIcon: true,
          subMenus: [
            {
              menuValue: 'LIST',
              route: routes.profileList,
              base: routes.profileList,
              permision: 'list_profile-m',
              show_nav: true,
            },
            {
              menuValue: 'ADD',
              route: routes.addProfile,
              base: routes.addProfile,
              permision: 'add_profile-m',
              show_nav: true,
            },
            {
              menuValue: 'EDIT',
              route: '',
              base: '',
              permision: 'edit_profile-m',
              show_nav: false,
            },
            {
              menuValue: 'DELETE',
              route: '',
              base: '',
              permision: 'delete_profile-m',
              show_nav: false,
            },
          ],
        },
        {
          menuValue: 'DEPARTAMENT',
          group: 'GRUPO_RH',
          hasSubRoute: true,
          showSubRoute: false,
          base: 'departaments-m',
          icon: 'fas fa-building',
          faIcon: true,
          subMenus: [
            {
              menuValue: 'LIST',
              route: routes.departmentList,
              base: routes.departmentList,
              permision: 'list_departament',
              show_nav: true,
            },
            {
              menuValue: 'ADD',
              route: routes.addDepartment,
              base: routes.addDepartment,
              permision: 'add_departament',
              show_nav: true,
            },
            {
              menuValue: 'EDIT',
              route: '',
              base: '',
              permision: 'edit_departament',
              show_nav: false,
            },
            {
              menuValue: 'DELETE',
              route: '',
              base: '',
              permision: 'delete_departament',
              show_nav: false,
            },
          ],
        },
        {
          menuValue: 'PERSONAL',
          group: 'GRUPO_RH',
          hasSubRoute: true,
          showSubRoute: false,
          base: 'personal',
          icon: 'fas fa-users-cog',
          faIcon: true,
          subMenus: [
            {
              menuValue: 'LIST',
              route: routes.personalList,
              base: routes.personalList,
              permision: 'list_personal',
              show_nav: true,
            },
            {
              menuValue: 'ADD',
              route: routes.addPersonal,
              base: routes.addPersonal,
              permision: 'add_personal',
              show_nav: true,
            },
            {
              menuValue: 'EDIT',
              route: '',
              base: '',
              permision: 'edit_personal',
              show_nav: false,
            },
            {
              menuValue: 'DELETE',
              route: '',
              base: '',
              permision: 'delete_personal',
              show_nav: false,
            },
          ],
        },
        {
          menuValue: 'PATIENT',
          group: 'GRUPO_ARCHIVO',
          hasSubRoute: true,
          showSubRoute: false,
          base: 'archives',
          icon: 'fas fa-user-injured',
          faIcon: true,
          subMenus: [
            {
              menuValue: 'ADD',
              route: routes.addArchive,
              base: routes.addArchive,
              permision: 'add_archive',
              show_nav: true,
            },
            {
              menuValue: 'LIST',
              route: routes.archiveList,
              base: routes.archiveList,
              permision: 'list_archive',
              show_nav: true,
            },
            {
              menuValue: 'EXPORT',
              route: routes.exportArchive,
              base: routes.exportArchive,
              permision: 'add_archive',
              show_nav: true,
            },
            {
              menuValue: 'BACKUP',
              route: routes.backupArchive,
              base: routes.backupArchive,
              permision: 'add_archive',
              show_nav: true,
            },
            {
              menuValue: 'EDIT',
              route: '',
              base: '',
              permision: 'edit_archive',
              show_nav: false,
            },
            {
              menuValue: 'DELETE',
              route: '',
              base: '',
              permision: 'delete_archive',
              show_nav: false,
            },
          ],
        },
        {
          menuValue: 'CREDITS',
          group: 'GRUPO_SISTEMA',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.credits,
          base: 'credits',
          icon: 'fas fa-info-circle',
          faIcon: true,
          permision: 'view_credits',
          show_nav: true,
          subMenus: [],
        },
        
        // {
        //   menuValue: 'Doctors',
        //   hasSubRoute: true,
        //   showSubRoute: false,
        //   base: 'doctor',
        //   icon: 'fas fa-user-md',
        //   faIcon: true,
        //   subMenus: [
        //     {
        //       menuValue: 'Doctor List',
        //       route: routes.doctorsList,
        //       base: routes.doctorsList,
        //       permision: 'list_doctor',
        //       show_nav: true,
        //     },
        //     {
        //       menuValue: 'Add Doctor',
        //       route: routes.addDoctor,
        //       base: routes.addDoctor,
        //       permision: 'register_doctor',
        //       show_nav: true,
        //     },
        //     {
        //       menuValue: 'Edit Doctor',
        //       route: '',
        //       base: '',
        //       permision: 'edit_doctor',
        //       show_nav: false,
        //     },
        //     {
        //       menuValue: 'Delete Doctor',
        //       route: '',
        //       base: '',
        //       permision: 'delete_doctor',
        //       show_nav: false,
        //     },
        //     {
        //       menuValue: 'Doctor Profile',
        //       route: routes.doctorProfile,
        //       base: routes.doctorProfile,
        //       permision: 'profile_doctor',
        //       show_nav: true,
        //     },
        //   ],
        // },
        // {
        //   menuValue: 'Patients',
        //   hasSubRoute: true,
        //   showSubRoute: false,
        //   base: 'patient',
        //   icon: 'fas fa-procedures',
        //   faIcon: true,
        //   subMenus: [
        //     {
        //       menuValue: 'Patients List',
        //       route: routes.patientsList,
        //       base: routes.patientsList,
        //       permision: 'list_patient',
        //       show_nav: true,
        //     },
        //     {
        //       menuValue: 'Add Patients',
        //       route: routes.addPatient,
        //       base: routes.addPatient,
        //       permision: 'register_patient',
        //       show_nav: true,
        //     },
        //     {
        //       menuValue: 'Edit Patients',
        //       route: '',
        //       base: '',
        //       permision: 'edit_patient',
        //       show_nav: false,
        //     },
        //     {
        //       menuValue: 'Delete Patients',
        //       route: '',
        //       base: '',
        //       permision: 'delete_patient',
        //       show_nav: false,
        //     },
        //     {
        //       menuValue: 'Patients Profile',
        //       route: routes.patientProfile,
        //       base: routes.patientProfile,
        //       permision: 'profile_patient',
        //       show_nav: true,
        //     },
        //   ],
        // },
        // {
        //   menuValue: 'Appointments',
        //   hasSubRoute: true,
        //   showSubRoute: false,
        //   base: 'appointments',
        //   icon: 'fas fa-calendar-check',
        //   faIcon: true,
        //   subMenus: [
        //     {
        //       menuValue: 'Appointment List',
        //       route: routes.appointmentList,
        //       base: routes.appointmentList,
        //       permision: 'list_appointment',
        //       show_nav: true,
        //     },
        //     {
        //       menuValue: 'Book Appointment',
        //       route: routes.addAppointment,
        //       base: routes.addAppointment,
        //       permision: 'register_appointment',
        //       show_nav: true,
        //     },
        //     {
        //       menuValue: 'Edit Appointment',
        //       route: '',
        //       base: '',
        //       permision: 'edit_appointment',
        //       show_nav: false,
        //     },
        //     {
        //       menuValue: 'Delete Appointment',
        //       route: '',
        //       base: '',
        //       permision: 'delete_appointment',
        //       show_nav: false,
        //     },
        //   ],
        // },
        // {
        //   menuValue: 'Pagos',
        //   hasSubRoute: true,
        //   showSubRoute: false,
        //   base: 'payroll',
        //   icon: 'fas fa-money-check-alt',
        //   faIcon: true,
        //   subMenus: [
        //     {
        //       menuValue: 'Ver Pagos',
        //       route: routes.salary,
        //       base: routes.salary,
        //       permision: 'show_payment',
        //       show_nav: true,
        //     },
        //     {
        //       menuValue: 'Edit Pagos',
        //       route: '',
        //       base: '',
        //       permision: 'edit_payment',
        //       show_nav: false,
        //     },
        //   ],
        // },
        // {
        //   menuValue: 'Activities',
        //   route: routes.activities,
        //   hasSubRoute: false,
        //   showSubRoute: false,
        //   icon: 'fas fa-tasks',
        //   faIcon: true,
        //   base: 'activities',
        //   permision: 'activitie',
        //   show_nav: true,
        //   subMenus: [],
        // },
        // {
        //   menuValue: 'Calendar',
        //   route: routes.calendar,
        //   hasSubRoute: false,
        //   showSubRoute: false,
        //   icon: 'fas fa-calendar',
        //   faIcon: true,
        //   base: 'calendar',
        //   permision: 'calendar',
        //   show_nav: true,
        //   subMenus: [],
        // },
      ],
    },
  ];
  // public sideBarList = [

  // ];

  public carousel1 = [
    {
      quantity: '68',
      units: 'kg',
    },
    {
      quantity: '70',
      units: 'kg',
    },
    {
      quantity: '72',
      units: 'kg',
    },
    {
      quantity: '74',
      units: 'kg',
    },
    {
      quantity: '76',
      units: 'kg',
    },
  ];
  public carousel2 = [
    {
      quantity: '160',
      units: 'cm',
    },
    {
      quantity: '162',
      units: 'cm',
    },
    {
      quantity: '164',
      units: 'cm',
    },
    {
      quantity: '166',
      units: 'cm',
    },
    {
      quantity: '168',
      units: 'cm',
    },
  ];
  public socialLinks = [
    {
      icon: 'facebook',
      placeholder: 'https://www.facebook.com'
    },
    {
      icon: 'twitter',
      placeholder: 'https://www.twitter.com'
    },
    {
      icon: 'youtube',
      placeholder: 'https://www.youtube.com'
    },
    {
      icon: 'linkedin',
      placeholder: 'https://www.linkedin.com'
    }
  ];
  public upcomingAppointments = [
    {
      "no" : "R00001",
      "patientName" : "Andrea Lalema",
      "doctor" : "Dr.Jenny Smith",
      "date" : "12.05.2022 at",
      "time" : "7.00 PM",
      "disease" : "Fracture",
      "img" : "assets/img/profiles/avatar-03.jpg"
  },
  {
      "no" : "R00002",
      "patientName" : "Cristina Groves",
      "doctor" : "Dr.Angelica Ramos",
      "date" : "13.05.2022 at",
      "time" : "7.00 PM",
      "disease" : "Fever",
      "img" : "assets/img/profiles/avatar-05.jpg"
  },
  {
      "no" : "R00003",
      "patientName" : "Bernardo",
      "doctor" : "Dr.Martin Doe",
      "date" : "14.05.2022 at",
      "time" : "7.00 PM",
      "disease" : "Fracture",
      "img" : "assets/img/profiles/avatar-04.jpg"
  },
  {
      "no" : "R00004",
      "patientName" : "Galaviz Lalema",
      "doctor" : "Dr.Martin Doe",
      "date" : "15.05.2022 at",
      "time" : "7.00 PM",
      "disease" : "Fracture",
      "img" : "assets/img/profiles/avatar-03.jpg"
  },
  {
      "no" : "R00005",
      "patientName" : "Dr.William Jerk",
      "doctor" : "Dr.Angelica Ramos",
      "date" : "16.05.2022 at",
      "time" : "7.00 PM",
      "disease" : "Fever",
      "img" : "assets/img/profiles/avatar-02.jpg"
  }
  ];
  public recentPatients = [
    {
      "no" : "R00001",
      "patientName" : "Andrea Lalema",
      "age" : "21",
      "date" : "12.05.2022 at",
      "dateOfBirth" : "07 January 2002",
      "diagnosis" : "Heart attack",
      "img" : "assets/img/profiles/avatar-02.jpg",
      "triage" : "Non Urgent"
  },
  {
      "no" : "R00002",
      "patientName" : "Mark Hay Smith",
      "age" : "23",
      "date" : "13.05.2022 at",
      "dateOfBirth" : "06 January 2002",
      "diagnosis" : "Jaundice",
      "img" : "assets/img/profiles/avatar-03.jpg",
      "triage" : "Emergency"
  },
  {
      "no" : "R00003",
      "patientName" : "Cristina Groves",
      "age" : "25",
      "date" : "14.05.2022 at",
      "dateOfBirth" : "10 January 2002",
      "diagnosis" : "Malaria",
      "img" : "assets/img/profiles/avatar-04.jpg",
      "triage" : "Out Patient"
  },
  {
      "no" : "R00004",
      "patientName" : "Galaviz Lalema",
      "age" : "21",
      "date" : "15.05.2022 at",
      "dateOfBirth" : "09 January 2002",
      "diagnosis" : "Typhoid",
      "img" : "assets/img/profiles/avatar-05.jpg",
      "triage" : "Urgent"
  }
  ];
  public patientProfile = [
    {
      date : "29/09/2022",
      doctor : "Dr.Jenny Smith",
      treatment : "Check up",
      charges : "$ 60"
    },
    {
      date : "19/09/2022",
      doctor : "Andrea Lalema",
      treatment : "	Blood Test",
      charges : "$ 50"
    },
    {
      date : "20/09/2022",
      doctor : "Dr.William Stephin",
      treatment : "Blood Pressure",
      charges : "$ 30"
    }
  ];
  public blogs = [
    {
      img1: "assets/img/blog/blog-1.jpg",
      img2: "assets/img/profiles/avatar-01.jpg",
      heading5: "Diabetes",
      count1: "58",
      count2: "500",
      date: "05 Sep 2022",
      heading4: "Jenifer Robinson",
      name: "M.B.B.S, Diabetologist",
      heading3: "Simple Changes That Lowered My Mom's Blood Pressure",
      paragraph: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...",
      msg: "Read more in 8 Minutes"
    },
    {
      img1: "assets/img/blog/blog-2.jpg",
      img2: "assets/img/profiles/avatar-02.jpg",
      heading5: "Safety",
      count1: "18",
      count2: "5k",
      date: "05 Sep 2022",
      heading4: "Mark hay smith",
      name: "M.B.B.S, Neurologist",
      heading3: "Vaccines Are Close - But Right Now We Need to Hunker Down",
      paragraph: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...",
      msg: "Read more in 2 Minutes"
    },
    {
      img1: "assets/img/blog/blog-3.jpg",
      img2: "assets/img/profiles/avatar-03.jpg",
      heading5: "Dermotology",
      count1: "28",
      count2: "2.5k",
      date: "05 Sep 2022",
      heading4: "Denise Stevens",
      name: "M.B.B.S, Dermotologist",
      heading3: "Hair Loss On One Side of Head – Causes & Treatments",
      paragraph: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...",
      msg: "Read more in 3 Minutes"
    },
    {
      img1: "assets/img/blog/blog-4.jpg",
      img2: "assets/img/profiles/avatar-05.jpg",
      heading5: "Ophthalmology",
      count1: "48",
      count2: "600",
      date: "05 Sep 2022",
      heading4: "Laura Williams",
      name: "M.B.B.S, Ophthalmologist",
      heading3: "Eye Care Routine To Get Rid Of Under Eye Circles And Puffiness",
      paragraph: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...",
      msg: "Read more in 5 Minutes"
    },
    {
      img1: "assets/img/blog/blog-5.jpg",
      img2: "assets/img/profiles/avatar-06.jpg",
      heading5: "Dentist",
      count1: "48",
      count2: "600",
      date: "05 Sep 2022",
      heading4: "Linda Carpenter",
      name: "M.B.B.S, Dentist",
      heading3: "5 Facts About Teeth Whitening You Should Know",
      paragraph: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...",
      msg: "Read more in 3 Minutes"
    },
    {
      img1: "assets/img/blog/blog-6.jpg",
      img2: "assets/img/profiles/avatar-04.jpg",
      heading5: "Gynecologist",
      count1: "18",
      count2: "300",
      date: "05 Sep 2022",
      heading4: "Mark hay smith",
      name: "M.B.B.S, Gynecologist",
      heading3: "Sciatica: Symptoms, Causes & Treatments",
      paragraph: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...",
      msg: "Read more in 10 Minutes"
    }
  ];
  public invoicesGrid = [
    {
      invoiceNumber: "IN093439#@09",
      name: "Barbara Moore",
      img: "assets/img/profiles/avatar-04.jpg",
      amount: "Amount",
      amounts: "$1,54,220",
      text: "Due Date",
      dueDate: "23 Mar 2022",
      status: "Paid",
    },
    {
      invoiceNumber: "IN093439#@10",
      name: "Karlene Chaidez",
      img: "assets/img/profiles/avatar-06.jpg",
      amount: "Amount",
      amounts: "$1,222",
      text: "Due Date",
      dueDate: "18 Mar 2022",
      status: "Overdue",
      overDue: "Overdue 14 days"
    },
    {
      invoiceNumber: "IN093439#@11",
      name: "Russell Copeland",
      img: "assets/img/profiles/avatar-08.jpg",
      amount: "Amount",
      amounts: "$3,470",
      text: "Due Date",
      dueDate: "10 Mar 2022",
      status: "Cancelled",
    },
    {
      invoiceNumber: "IN093439#@12",
      name: "Joseph Collins",
      img: "assets/img/profiles/avatar-10.jpg",
      amount: "Amount",
      amounts: "$8,265",
      text: "Due Date",
      dueDate: "30 Mar 2022",
      status: "Sent",
    },
    {
      invoiceNumber: "IN093439#@13",
      name: "Jennifer Floyd",
      img: "assets/img/profiles/avatar-11.jpg",
      amount: "Amount",
      amounts: "$5,200",
      text: "Due Date",
      dueDate: "20 Mar 2022",
      status: "Cancelled",
    },
    {
      invoiceNumber: "IN093439#@14",
      name: "Leatha Bailey",
      img: "assets/img/profiles/avatar-09.jpg",
      amount: "Amount",
      amounts: "$480",
      text: "Due Date",
      dueDate: "15 Mar 2022",
      status: "Sent",
    },
    {
      invoiceNumber: "IN093439#@15",
      name: "Alex Campbell",
      img: "assets/img/profiles/avatar-12.jpg",
      amount: "Amount",
      amounts: "$1,999",
      text: "Due Date",
      dueDate: "08 Mar 2022",
      status: "Overdue",
      overDue: "Overdue 10 days"
    },
    {
      invoiceNumber: "IN093439#@16",
      name: "Marie Canales",
      img: "assets/img/profiles/avatar-03.jpg",
      amount: "Amount",
      amounts: "$2,700",
      text: "Due Date",
      dueDate: "18 Mar 2022",
      status: "Paid",
    },
  ]
}
