import { Injectable } from '@angular/core';
import { driver } from 'driver.js';
import type { DriveStep, Config } from 'driver.js';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class DriverTourService {
  private driverInstance: any;

  constructor(private translate: TranslateService) { }

  /**
   * Inicializa el tour para la lista de archivos médicos
   */
  startArchiveListTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_LIST.BREADCRUMB_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_LIST.BREADCRUMB_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.filters-container',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_LIST.FILTERS_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_LIST.FILTERS_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: 'input[placeholder*="expediente"], input[placeholder*="record"]',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_LIST.SEARCH_RECORD_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_LIST.SEARCH_RECORD_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[placeholder*="nombre"], input[placeholder*="name"]',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_LIST.SEARCH_NAME_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_LIST.SEARCH_NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.clear-filters-btn',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_LIST.CLEAR_FILTERS_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_LIST.CLEAR_FILTERS_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.add-patient-btn',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_LIST.ADD_PATIENT_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_LIST.ADD_PATIENT_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.table-responsive',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_LIST.TABLE_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_LIST.TABLE_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.pagination',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_LIST.PAGINATION_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_LIST.PAGINATION_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.5)',
      onDestroyed: () => {
        this.saveTourCompleted('archive-list');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para el formulario de agregar/editar archivo 
   */
  startArchiveFormTour(): void {
    const steps: DriveStep[] = [
      // Número de expediente
      {
        element: 'input[name="archive_number"]',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_FORM.ARCHIVE_NUMBER_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_FORM.ARCHIVE_NUMBER_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      // Nombre(s)
      {
        element: 'input[name="name"]',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_FORM.NAME_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_FORM.NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      // Apellido paterno
      {
        element: 'input[name="last_name_father"]',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_FORM.FATHER_LAST_NAME_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_FORM.FATHER_LAST_NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      // Apellido materno
      {
        element: 'input[name="last_name_mother"]',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_FORM.MOTHER_LAST_NAME_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_FORM.MOTHER_LAST_NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      // Edad
      {
        element: 'input[name="age"]',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_FORM.AGE_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_FORM.AGE_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      // Unidad de edad
      {
        element: 'select[name="age_unit"]',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_FORM.AGE_UNIT_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_FORM.AGE_UNIT_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      // Género
      {
        element: 'select[name="gender_id"]',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_FORM.GENDER_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_FORM.GENDER_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      // Ubicación (localidad)
      {
        element: 'input[name="location_text"]',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_FORM.LOCATION_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_FORM.LOCATION_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      // Municipio
      {
        element: 'input[name="municipality_text"]',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_FORM.MUNICIPALITY_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_FORM.MUNICIPALITY_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      // Estado
      {
        element: 'input[name="state_text"]',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_FORM.STATE_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_FORM.STATE_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      // Fecha de ingreso / admisión
      {
        element: 'input[name="admission_date"]',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_FORM.ADMISSION_DATE_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_FORM.ADMISSION_DATE_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      // Botón guardar
      {
        element: '.btn-save, .btn-primary',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_FORM.SAVE_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_FORM.SAVE_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      // Botón Cancelar (redirige al listado)
      {
        element: '.btn-cancel, .btn-outline-secondary',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_FORM.CANCEL_BUTTON_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_FORM.CANCEL_BUTTON_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        // Marcar como completado el tour específico de bienvenida del formulario
        this.saveTourCompleted('archive-form-welcome');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour rápido para destacar una funcionalidad específica
   */
  highlightElement(selector: string, title: string, description: string): void {
    const config: Config = {
      showButtons: ['close'],
      doneBtnText: this.translate.instant('TOUR.DONE'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-highlight',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.2)'
    };

    const highlightDriver = driver(config);
    highlightDriver.highlight({
      element: selector,
      popover: {
        title: title,
        description: description,
        side: 'bottom',
        align: 'center'
      }
    });
  }

  /**
   * Verifica si un tour ya fue completado
   */
  isTourCompleted(tourId: string): boolean {
    const completedTours = JSON.parse(localStorage.getItem('completedTours') || '[]');
    return completedTours.includes(tourId);
  }

  /**
   * Marca un tour como completado
   */
  private saveTourCompleted(tourId: string): void {
    const completedTours = JSON.parse(localStorage.getItem('completedTours') || '[]');
    if (!completedTours.includes(tourId)) {
      completedTours.push(tourId);
      localStorage.setItem('completedTours', JSON.stringify(completedTours));
    }
  }

  /**
   * Reinicia todos los tours (útil para testing o nuevos usuarios)
   */
  resetAllTours(): void {
    localStorage.removeItem('completedTours');
  }

  /**
   * Tour para la página de edición de archivo médico
   */
  startEditArchiveTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.card-form',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ARCHIVE.FORM_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ARCHIVE.FORM_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="archive_number"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ARCHIVE.ARCHIVE_NUMBER_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ARCHIVE.ARCHIVE_NUMBER_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="name"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ARCHIVE.NAME_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ARCHIVE.NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="last_name_father"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ARCHIVE.FATHER_LAST_NAME_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ARCHIVE.FATHER_LAST_NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="last_name_mother"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ARCHIVE.MOTHER_LAST_NAME_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ARCHIVE.MOTHER_LAST_NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="age"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ARCHIVE.AGE_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ARCHIVE.AGE_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'select[name="age_unit"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ARCHIVE.AGE_UNIT_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ARCHIVE.AGE_UNIT_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'select[name="gender_id"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ARCHIVE.GENDER_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ARCHIVE.GENDER_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="state_text"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ARCHIVE.STATE_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ARCHIVE.STATE_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="municipality_text"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ARCHIVE.MUNICIPALITY_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ARCHIVE.MUNICIPALITY_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="location_text"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ARCHIVE.LOCATION_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ARCHIVE.LOCATION_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="admission_date"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ARCHIVE.ADMISSION_DATE_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ARCHIVE.ADMISSION_DATE_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-primary',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ARCHIVE.UPDATE_BUTTON_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ARCHIVE.UPDATE_BUTTON_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('edit-archive');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para la página de exportación de archivos médicos
   */
  startExportArchiveTour(): void {
    const steps: DriveStep[] = [
      // Contenedor de filtros
      {
        element: '.filters-container',
        popover: {
          title: this.translate.instant('TOUR.EXPORT_ARCHIVE.FILTERS_TITLE'),
          description: this.translate.instant('TOUR.EXPORT_ARCHIVE.FILTERS_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      // Filtro por género (primer select)
      {
        element: '.filters-container .row > .col-lg-3:nth-child(1) select.filter-select',
        popover: {
          title: this.translate.instant('TOUR.EXPORT_ARCHIVE.GENDER_FILTER_TITLE'),
          description: this.translate.instant('TOUR.EXPORT_ARCHIVE.GENDER_FILTER_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      // Filtro por año (segundo select)
      {
        element: '.filters-container .row > .col-lg-3:nth-child(2) select.filter-select',
        popover: {
          title: this.translate.instant('TOUR.EXPORT_ARCHIVE.YEAR_FILTER_TITLE'),
          description: this.translate.instant('TOUR.EXPORT_ARCHIVE.YEAR_FILTER_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      // Filtro por mes (tercer select)
      {
        element: '.filters-container .row > .col-lg-3:nth-child(3) select.filter-select',
        popover: {
          title: this.translate.instant('TOUR.EXPORT_ARCHIVE.MONTH_FILTER_TITLE'),
          description: this.translate.instant('TOUR.EXPORT_ARCHIVE.MONTH_FILTER_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      // Botón limpiar filtros
      {
        element: '.filters-container .btn-outline-secondary',
        popover: {
          title: this.translate.instant('TOUR.EXPORT_ARCHIVE.CLEAR_FILTERS_TITLE'),
          description: this.translate.instant('TOUR.EXPORT_ARCHIVE.CLEAR_FILTERS_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      // Botones de exportación
      {
        element: '.export-buttons',
        popover: {
          title: this.translate.instant('TOUR.EXPORT_ARCHIVE.EXPORT_BUTTONS_TITLE'),
          description: this.translate.instant('TOUR.EXPORT_ARCHIVE.EXPORT_BUTTONS_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      // Botón Excel
      {
        element: '.export-btn-excel',
        popover: {
          title: this.translate.instant('TOUR.EXPORT_ARCHIVE.EXCEL_BUTTON_TITLE'),
          description: this.translate.instant('TOUR.EXPORT_ARCHIVE.EXCEL_BUTTON_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      // Botón PDF
      {
        element: '.export-btn-pdf',
        popover: {
          title: this.translate.instant('TOUR.EXPORT_ARCHIVE.PDF_BUTTON_TITLE'),
          description: this.translate.instant('TOUR.EXPORT_ARCHIVE.PDF_BUTTON_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      // Vista previa
      {
        element: '.preview-table',
        popover: {
          title: this.translate.instant('TOUR.EXPORT_ARCHIVE.PREVIEW_TABLE_TITLE'),
          description: this.translate.instant('TOUR.EXPORT_ARCHIVE.PREVIEW_TABLE_DESC'),
          side: 'top',
          align: 'start'
        }
      },
      // Total de registros
      {
        element: '.export-count-text',
        popover: {
          title: this.translate.instant('TOUR.EXPORT_ARCHIVE.TOTAL_RECORDS_TITLE'),
          description: this.translate.instant('TOUR.EXPORT_ARCHIVE.TOTAL_RECORDS_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      // Selector de registros por página
      {
        element: '.page-size-selector select',
        popover: {
          title: this.translate.instant('TOUR.EXPORT_ARCHIVE.RECORDS_PER_PAGE_TITLE'),
          description: this.translate.instant('TOUR.EXPORT_ARCHIVE.RECORDS_PER_PAGE_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('export-archive');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para la página de respaldos de archivos médicos
   */
  startBackupsArchiveTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.page-header',
        popover: {
          title: this.translate.instant('TOUR.BACKUPS_ARCHIVE.HEADER_TITLE'),
          description: this.translate.instant('TOUR.BACKUPS_ARCHIVE.HEADER_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.filters-container',
        popover: {
          title: this.translate.instant('TOUR.BACKUPS_ARCHIVE.SEARCH_TITLE'),
          description: this.translate.instant('TOUR.BACKUPS_ARCHIVE.SEARCH_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.stats-container',
        popover: {
          title: this.translate.instant('TOUR.BACKUPS_ARCHIVE.STATS_TITLE'),
          description: this.translate.instant('TOUR.BACKUPS_ARCHIVE.STATS_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.backups-table',
        popover: {
          title: this.translate.instant('TOUR.BACKUPS_ARCHIVE.TABLE_TITLE'),
          description: this.translate.instant('TOUR.BACKUPS_ARCHIVE.TABLE_DESC'),
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '.btn-download',
        popover: {
          title: this.translate.instant('TOUR.BACKUPS_ARCHIVE.DOWNLOAD_TITLE'),
          description: this.translate.instant('TOUR.BACKUPS_ARCHIVE.DOWNLOAD_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('backups-archive');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para la lista de tipos de contrato
   */
  startContractTypesListTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: this.translate.instant('TOUR.CONTRACT_TYPES_LIST.BREADCRUMB_TITLE'),
          description: this.translate.instant('TOUR.CONTRACT_TYPES_LIST.BREADCRUMB_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.header-bar',
        popover: {
          title: this.translate.instant('TOUR.CONTRACT_TYPES_LIST.HEADER_TITLE'),
          description: this.translate.instant('TOUR.CONTRACT_TYPES_LIST.HEADER_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.search-box',
        popover: {
          title: this.translate.instant('TOUR.CONTRACT_TYPES_LIST.SEARCH_TITLE'),
          description: this.translate.instant('TOUR.CONTRACT_TYPES_LIST.SEARCH_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-options',
        popover: {
          title: this.translate.instant('TOUR.CONTRACT_TYPES_LIST.ADD_BUTTON_TITLE'),
          description: this.translate.instant('TOUR.CONTRACT_TYPES_LIST.ADD_BUTTON_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.table-responsive',
        popover: {
          title: this.translate.instant('TOUR.CONTRACT_TYPES_LIST.TABLE_TITLE'),
          description: this.translate.instant('TOUR.CONTRACT_TYPES_LIST.TABLE_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.justify-content-center',
        popover: {
          title: this.translate.instant('TOUR.CONTRACT_TYPES_LIST.PERMISSIONS_TITLE'),
          description: this.translate.instant('TOUR.CONTRACT_TYPES_LIST.PERMISSIONS_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.small',
        popover: {
          title: this.translate.instant('TOUR.CONTRACT_TYPES_LIST.SHOW_REGISTERS_TITLE'),
          description: this.translate.instant('TOUR.CONTRACT_TYPES_LIST.SHOW_REGISTERS_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.pagination',
        popover: {
          title: this.translate.instant('TOUR.CONTRACT_TYPES_LIST.PAGINATION_TITLE'),
          description: this.translate.instant('TOUR.CONTRACT_TYPES_LIST.PAGINATION_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('contract-types-list');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para el formulario de agregar tipo de contrato
   */
  startContractTypesFormTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: this.translate.instant('TOUR.CONTRACT_TYPES_FORM.BREADCRUMB_TITLE'),
          description: this.translate.instant('TOUR.CONTRACT_TYPES_FORM.BREADCRUMB_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="name"]',
        popover: {
          title: this.translate.instant('TOUR.CONTRACT_TYPES_FORM.NAME_TITLE'),
          description: this.translate.instant('TOUR.CONTRACT_TYPES_FORM.NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.toggle-wrapper',
        popover: {
          title: this.translate.instant('TOUR.CONTRACT_TYPES_FORM.STATE_TITLE'),
          description: this.translate.instant('TOUR.CONTRACT_TYPES_FORM.STATE_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-primary',
        popover: {
          title: this.translate.instant('TOUR.CONTRACT_TYPES_FORM.SAVE_TITLE'),
          description: this.translate.instant('TOUR.CONTRACT_TYPES_FORM.SAVE_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('contract-types-form');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para editar tipo de contrato
   */
  startEditContractTypeTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.page-header',
        popover: {
          title: this.translate.instant('TOUR.EDIT_CONTRACT_TYPE.FORM_TITLE'),
          description: this.translate.instant('TOUR.EDIT_CONTRACT_TYPE.FORM_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="name"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_CONTRACT_TYPE.NAME_TITLE'),
          description: this.translate.instant('TOUR.EDIT_CONTRACT_TYPE.NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.toggle-wrapper',
        popover: {
          title: this.translate.instant('TOUR.EDIT_CONTRACT_TYPE.STATE_TITLE'),
          description: this.translate.instant('TOUR.EDIT_CONTRACT_TYPE.STATE_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.' +
          'btn-primary',
        popover: {
          title: this.translate.instant('TOUR.EDIT_CONTRACT_TYPE.UPDATE_TITLE'),
          description: this.translate.instant('TOUR.EDIT_CONTRACT_TYPE.UPDATE_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('edit-contract-type');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para el dashboard de archivo
   */
  startArchiveDashboardTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_DASHBOARD.BREADCRUMB_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_DASHBOARD.BREADCRUMB_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.hero',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_DASHBOARD.HERO_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_DASHBOARD.HERO_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.kpi-grid',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_DASHBOARD.KPI_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_DASHBOARD.KPI_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.panel-gender',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_DASHBOARD.GENDER_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_DASHBOARD.GENDER_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.panel-locations',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_DASHBOARD.LOCATIONS_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_DASHBOARD.LOCATIONS_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.panel-actions',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_DASHBOARD.ACTIONS_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_DASHBOARD.ACTIONS_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.weekly-chart',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_DASHBOARD.WEEKLY_CHART_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_DASHBOARD.WEEKLY_CHART_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.monthly-chart',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_DASHBOARD.MONTHLY_CHART_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_DASHBOARD.MONTHLY_CHART_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.yearly-list',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_DASHBOARD.YEARLY_CHART_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_DASHBOARD.YEARLY_CHART_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.btn-refresh',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_DASHBOARD.REFRESH_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_DASHBOARD.REFRESH_DESC'),
          side: 'bottom',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('archive-dashboard');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
 * Tour para el dashboard de actividades de usuarios
 */
  startUserActivityDashboardTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: this.translate.instant('TOUR.DASHBOARD_USER_ACTIVITIES.BREADCRUMB_TITLE'),
          description: this.translate.instant('TOUR.DASHBOARD_USER_ACTIVITIES.BREADCRUMB_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.hero',
        popover: {
          title: this.translate.instant('TOUR.DASHBOARD_USER_ACTIVITIES.HERO_TITLE'),
          description: this.translate.instant('TOUR.DASHBOARD_USER_ACTIVITIES.HERO_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.kpi-grid',
        popover: {
          title: this.translate.instant('TOUR.DASHBOARD_USER_ACTIVITIES.KPI_TITLE'),
          description: this.translate.instant('TOUR.DASHBOARD_USER_ACTIVITIES.KPI_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.panel-activity-stats',
        popover: {
          title: this.translate.instant('TOUR.DASHBOARD_USER_ACTIVITIES.ACTIVITY_TYPES_TITLE'),
          description: this.translate.instant('TOUR.DASHBOARD_USER_ACTIVITIES.ACTIVITY_TYPES_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.panel-modules',
        popover: {
          title: this.translate.instant('TOUR.DASHBOARD_USER_ACTIVITIES.MODULES_TITLE'),
          description: this.translate.instant('TOUR.DASHBOARD_USER_ACTIVITIES.MODULES_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.panel-top-users',
        popover: {
          title: this.translate.instant('TOUR.DASHBOARD_USER_ACTIVITIES.TOP_USERS_TITLE'),
          description: this.translate.instant('TOUR.DASHBOARD_USER_ACTIVITIES.TOP_USERS_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.panel-hourly-stats',
        popover: {
          title: this.translate.instant('TOUR.DASHBOARD_USER_ACTIVITIES.HOURLY_TITLE'),
          description: this.translate.instant('TOUR.DASHBOARD_USER_ACTIVITIES.HOURLY_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.separated-activities',
        popover: {
          title: this.translate.instant('TOUR.DASHBOARD_USER_ACTIVITIES.SEPARATED_TITLE'),
          description: this.translate.instant('TOUR.DASHBOARD_USER_ACTIVITIES.SEPARATED_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.daily-chart',
        popover: {
          title: this.translate.instant('TOUR.DASHBOARD_USER_ACTIVITIES.DAILY_CHART_TITLE'),
          description: this.translate.instant('TOUR.DASHBOARD_USER_ACTIVITIES.DAILY_CHART_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.module-chart',
        popover: {
          title: this.translate.instant('TOUR.DASHBOARD_USER_ACTIVITIES.MODULE_CHART_TITLE'),
          description: this.translate.instant('TOUR.DASHBOARD_USER_ACTIVITIES.MODULE_CHART_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.recent-activities',
        popover: {
          title: this.translate.instant('TOUR.DASHBOARD_USER_ACTIVITIES.RECENT_ACTIVITIES_TITLE'),
          description: this.translate.instant('TOUR.DASHBOARD_USER_ACTIVITIES.RECENT_ACTIVITIES_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('user-activity-dashboard');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para la lista de personal
   */
  startPersonalListTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_LIST.BREADCRUMB_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_LIST.BREADCRUMB_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.header-bar',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_LIST.HEADER_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_LIST.HEADER_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.search-box',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_LIST.SEARCH_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_LIST.SEARCH_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.row.g-2',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_LIST.FILTERS_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_LIST.FILTERS_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.personnel-grid',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_LIST.CARDS_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_LIST.CARDS_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.action-buttons-compact',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_LIST.ACTIONS_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_LIST.ACTIONS_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.alert.alert-info',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_LIST.STATS_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_LIST.STATS_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.pagination',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_LIST.PAGINATION_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_LIST.PAGINATION_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('personal-list');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para el formulario de agregar personal
   */
  startPersonalFormTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_FORM.BREADCRUMB_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_FORM.BREADCRUMB_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.form-header',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_FORM.HEADER_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_FORM.HEADER_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: 'input[name="nombre"]',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_FORM.NAME_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_FORM.NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="apellidos"]',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_FORM.SURNAME_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_FORM.SURNAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'select[name="tipo"]',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_FORM.TYPE_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_FORM.TYPE_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="rfc"]',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_FORM.RFC_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_FORM.RFC_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="numeroChecador"]',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_FORM.CLOCK_NUMBER_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_FORM.CLOCK_NUMBER_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '[data-tour="personal-documents"]',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_FORM.DOCUMENTS_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_FORM.DOCUMENTS_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.document-upload-card',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_FORM.UPLOAD_AREA_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_FORM.UPLOAD_AREA_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.btn-save',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_FORM.SAVE_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_FORM.SAVE_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('personal-form');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para editar personal
   */
  startEditPersonalTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.card-form',
        popover: {
          title: this.translate.instant('TOUR.EDIT_PERSONAL.FORM_TITLE'),
          description: this.translate.instant('TOUR.EDIT_PERSONAL.FORM_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="nombre"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_PERSONAL.NAME_TITLE'),
          description: this.translate.instant('TOUR.EDIT_PERSONAL.NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'select[name="tipo"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_PERSONAL.TYPE_TITLE'),
          description: this.translate.instant('TOUR.EDIT_PERSONAL.TYPE_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="rfc"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_PERSONAL.RFC_TITLE'),
          description: this.translate.instant('TOUR.EDIT_PERSONAL.RFC_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-primary',
        popover: {
          title: this.translate.instant('TOUR.EDIT_PERSONAL.UPDATE_TITLE'),
          description: this.translate.instant('TOUR.EDIT_PERSONAL.UPDATE_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('edit-personal');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour específico para la sección de documentos de personal
   */
  startPersonalDocumentsTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.alert-modern.alert-info',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_DOCUMENTS.INFO_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_DOCUMENTS.INFO_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.upload-info-card',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_DOCUMENTS.COUNTER_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_DOCUMENTS.COUNTER_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.upload-area',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_DOCUMENTS.UPLOAD_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_DOCUMENTS.UPLOAD_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.documents-status',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_DOCUMENTS.STATUS_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_DOCUMENTS.STATUS_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('personal-documents');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para las cards de personal
   */
  startPersonalCardsTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.personnel-card',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_CARDS.CARD_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_CARDS.CARD_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.personnel-card-header',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_CARDS.HEADER_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_CARDS.HEADER_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.badge-type',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_CARDS.TYPE_BADGE_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_CARDS.TYPE_BADGE_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.badge-status',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_CARDS.STATUS_BADGE_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_CARDS.STATUS_BADGE_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.action-buttons-compact',
        popover: {
          title: this.translate.instant('TOUR.PERSONAL_CARDS.ACTIONS_TITLE'),
          description: this.translate.instant('TOUR.PERSONAL_CARDS.ACTIONS_DESC'),
          side: 'bottom',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('personal-cards');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para el compresor de PDF
   */
  startPdfCompressorTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.modern-header',
        popover: {
          title: this.translate.instant('TOUR.PDF_COMPRESSOR.HEADER_TITLE'),
          description: this.translate.instant('TOUR.PDF_COMPRESSOR.HEADER_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.dropzone',
        popover: {
          title: this.translate.instant('TOUR.PDF_COMPRESSOR.DROPZONE_TITLE'),
          description: this.translate.instant('TOUR.PDF_COMPRESSOR.DROPZONE_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.btn-select',
        popover: {
          title: this.translate.instant('TOUR.PDF_COMPRESSOR.BROWSE_BUTTON_TITLE'),
          description: this.translate.instant('TOUR.PDF_COMPRESSOR.BROWSE_BUTTON_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.info-grid',
        popover: {
          title: this.translate.instant('TOUR.PDF_COMPRESSOR.RECOMMENDATIONS_TITLE'),
          description: this.translate.instant('TOUR.PDF_COMPRESSOR.RECOMMENDATIONS_DESC'),
          side: 'top',
          align: 'start'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('pdf-compressor');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para la lista de departamentos
   */
  startDepartamentsListTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: this.translate.instant('TOUR.DEPARTAMENTS_LIST.BREADCRUMB_TITLE'),
          description: this.translate.instant('TOUR.DEPARTAMENTS_LIST.BREADCRUMB_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.header-bar',
        popover: {
          title: this.translate.instant('TOUR.DEPARTAMENTS_LIST.HEADER_TITLE'),
          description: this.translate.instant('TOUR.DEPARTAMENTS_LIST.HEADER_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.search-box',
        popover: {
          title: this.translate.instant('TOUR.DEPARTAMENTS_LIST.SEARCH_TITLE'),
          description: this.translate.instant('TOUR.DEPARTAMENTS_LIST.SEARCH_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-primary',
        popover: {
          title: this.translate.instant('TOUR.DEPARTAMENTS_LIST.ADD_BUTTON_TITLE'),
          description: this.translate.instant('TOUR.DEPARTAMENTS_LIST.ADD_BUTTON_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.table-responsive',
        popover: {
          title: this.translate.instant('TOUR.DEPARTAMENTS_LIST.TABLE_TITLE'),
          description: this.translate.instant('TOUR.DEPARTAMENTS_LIST.TABLE_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.pagination',
        popover: {
          title: this.translate.instant('TOUR.DEPARTAMENTS_LIST.PAGINATION_TITLE'),
          description: this.translate.instant('TOUR.DEPARTAMENTS_LIST.PAGINATION_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('departaments-list');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para el formulario de agregar departamento
   */
  startDepartamentsFormTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: this.translate.instant('TOUR.DEPARTAMENTS_FORM.BREADCRUMB_TITLE'),
          description: this.translate.instant('TOUR.DEPARTAMENTS_FORM.BREADCRUMB_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="name"]',
        popover: {
          title: this.translate.instant('TOUR.DEPARTAMENTS_FORM.NAME_TITLE'),
          description: this.translate.instant('TOUR.DEPARTAMENTS_FORM.NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.toggle-wrapper',
        popover: {
          title: this.translate.instant('TOUR.DEPARTAMENTS_FORM.STATE_TITLE'),
          description: this.translate.instant('TOUR.DEPARTAMENTS_FORM.STATE_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-primary',
        popover: {
          title: this.translate.instant('TOUR.DEPARTAMENTS_FORM.SAVE_TITLE'),
          description: this.translate.instant('TOUR.DEPARTAMENTS_FORM.SAVE_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('departaments-form');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para editar departamento
   */
  startEditDepartamentTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.page-header',
        popover: {
          title: this.translate.instant('TOUR.EDIT_DEPARTAMENT.FORM_TITLE'),
          description: this.translate.instant('TOUR.EDIT_DEPARTAMENT.FORM_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="name"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_DEPARTAMENT.NAME_TITLE'),
          description: this.translate.instant('TOUR.EDIT_DEPARTAMENT.NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.toggle-wrapper',
        popover: {
          title: this.translate.instant('TOUR.EDIT_DEPARTAMENT.STATE_TITLE'),
          description: this.translate.instant('TOUR.EDIT_DEPARTAMENT.STATE_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-primary',
        popover: {
          title: this.translate.instant('TOUR.EDIT_DEPARTAMENT.UPDATE_TITLE'),
          description: this.translate.instant('TOUR.EDIT_DEPARTAMENT.UPDATE_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('edit-departament');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para la lista de perfiles
   */
  startProfilesListTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: this.translate.instant('TOUR.PROFILES_LIST.BREADCRUMB_TITLE'),
          description: this.translate.instant('TOUR.PROFILES_LIST.BREADCRUMB_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.header-bar',
        popover: {
          title: this.translate.instant('TOUR.PROFILES_LIST.HEADER_TITLE'),
          description: this.translate.instant('TOUR.PROFILES_LIST.HEADER_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.search-box',
        popover: {
          title: this.translate.instant('TOUR.PROFILES_LIST.SEARCH_TITLE'),
          description: this.translate.instant('TOUR.PROFILES_LIST.SEARCH_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-primary',
        popover: {
          title: this.translate.instant('TOUR.PROFILES_LIST.ADD_BUTTON_TITLE'),
          description: this.translate.instant('TOUR.PROFILES_LIST.ADD_BUTTON_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.table-responsive',
        popover: {
          title: this.translate.instant('TOUR.PROFILES_LIST.TABLE_TITLE'),
          description: this.translate.instant('TOUR.PROFILES_LIST.TABLE_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.pagination',
        popover: {
          title: this.translate.instant('TOUR.PROFILES_LIST.PAGINATION_TITLE'),
          description: this.translate.instant('TOUR.PROFILES_LIST.PAGINATION_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('profiles-list');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para el formulario de agregar perfil
   */
  startProfilesFormTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: this.translate.instant('TOUR.PROFILES_FORM.BREADCRUMB_TITLE'),
          description: this.translate.instant('TOUR.PROFILES_FORM.BREADCRUMB_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="name"]',
        popover: {
          title: this.translate.instant('TOUR.PROFILES_FORM.NAME_TITLE'),
          description: this.translate.instant('TOUR.PROFILES_FORM.NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.toggle-wrapper',
        popover: {
          title: this.translate.instant('TOUR.PROFILES_FORM.STATE_TITLE'),
          description: this.translate.instant('TOUR.PROFILES_FORM.STATE_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-primary',
        popover: {
          title: this.translate.instant('TOUR.PROFILES_FORM.SAVE_TITLE'),
          description: this.translate.instant('TOUR.PROFILES_FORM.SAVE_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('profiles-form');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para editar perfil
   */
  startEditProfileTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.page-header',
        popover: {
          title: this.translate.instant('TOUR.EDIT_PROFILE.FORM_TITLE'),
          description: this.translate.instant('TOUR.EDIT_PROFILE.FORM_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="name"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_PROFILE.NAME_TITLE'),
          description: this.translate.instant('TOUR.EDIT_PROFILE.NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.toggle-wrapper',
        popover: {
          title: this.translate.instant('TOUR.EDIT_PROFILE.STATE_TITLE'),
          description: this.translate.instant('TOUR.EDIT_PROFILE.STATE_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-primary',
        popover: {
          title: this.translate.instant('TOUR.EDIT_PROFILE.UPDATE_TITLE'),
          description: this.translate.instant('TOUR.EDIT_PROFILE.UPDATE_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('edit-profile');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para la lista de familias de roles
   */
  startRoleFamiliesListTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: this.translate.instant('TOUR.ROLE_FAMILIES_LIST.BREADCRUMB_TITLE'),
          description: this.translate.instant('TOUR.ROLE_FAMILIES_LIST.BREADCRUMB_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.header-bar',
        popover: {
          title: this.translate.instant('TOUR.ROLE_FAMILIES_LIST.HEADER_TITLE'),
          description: this.translate.instant('TOUR.ROLE_FAMILIES_LIST.HEADER_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.search-box',
        popover: {
          title: this.translate.instant('TOUR.ROLE_FAMILIES_LIST.SEARCH_TITLE'),
          description: this.translate.instant('TOUR.ROLE_FAMILIES_LIST.SEARCH_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.align-items-center',
        popover: {
          title: this.translate.instant('TOUR.ROLE_FAMILIES_LIST.ADD_BUTTON_TITLE'),
          description: this.translate.instant('TOUR.ROLE_FAMILIES_LIST.ADD_BUTTON_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.table-responsive',
        popover: {
          title: this.translate.instant('TOUR.ROLE_FAMILIES_LIST.TABLE_TITLE'),
          description: this.translate.instant('TOUR.ROLE_FAMILIES_LIST.TABLE_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('role-families-list');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para el formulario de agregar familia de roles
   */
  startRoleFamiliesFormTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: this.translate.instant('TOUR.ROLE_FAMILIES_FORM.BREADCRUMB_TITLE'),
          description: this.translate.instant('TOUR.ROLE_FAMILIES_FORM.BREADCRUMB_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="name"]',
        popover: {
          title: this.translate.instant('TOUR.ROLE_FAMILIES_FORM.NAME_TITLE'),
          description: this.translate.instant('TOUR.ROLE_FAMILIES_FORM.NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-save',
        popover: {
          title: this.translate.instant('TOUR.ROLE_FAMILIES_FORM.SAVE_TITLE'),
          description: this.translate.instant('TOUR.ROLE_FAMILIES_FORM.SAVE_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('role-families-form');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para editar familia de roles
   */
  startEditRoleFamilyTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.page-header',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ROLE_FAMILY.FORM_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ROLE_FAMILY.FORM_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="name"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ROLE_FAMILY.NAME_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ROLE_FAMILY.NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-save',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ROLE_FAMILY.UPDATE_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ROLE_FAMILY.UPDATE_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('edit-role-family');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para asignar roles a familia de roles
   */
  startAssignRolesRoleFamilyTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.page-header',
        popover: {
          title: this.translate.instant('TOUR.ASSIGN_ROLES_ROLE_FAMILY.FORM_TITLE'),
          description: this.translate.instant('TOUR.ASSIGN_ROLES_ROLE_FAMILY.FORM_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.family-selector-section',
        popover: {
          title: this.translate.instant('TOUR.ASSIGN_ROLES_ROLE_FAMILY.SELECTOR_TITLE'),
          description: this.translate.instant('TOUR.ASSIGN_ROLES_ROLE_FAMILY.SELECTOR_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.roles-grid-section',
        popover: {
          title: this.translate.instant('TOUR.ASSIGN_ROLES_ROLE_FAMILY.ROLES_LIST_TITLE'),
          description: this.translate.instant('TOUR.ASSIGN_ROLES_ROLE_FAMILY.ROLES_LIST_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-save',
        popover: {
          title: this.translate.instant('TOUR.ASSIGN_ROLES_ROLE_FAMILY.SAVE_TITLE'),
          description: this.translate.instant('TOUR.ASSIGN_ROLES_ROLE_FAMILY.SAVE_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('assign-roles-role-family');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para la lista de roles
   */
  startRolesListTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: this.translate.instant('TOUR.ROLES_LIST.BREADCRUMB_TITLE'),
          description: this.translate.instant('TOUR.ROLES_LIST.BREADCRUMB_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.header-bar',
        popover: {
          title: this.translate.instant('TOUR.ROLES_LIST.HEADER_TITLE'),
          description: this.translate.instant('TOUR.ROLES_LIST.HEADER_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.search-box',
        popover: {
          title: this.translate.instant('TOUR.ROLES_LIST.SEARCH_TITLE'),
          description: this.translate.instant('TOUR.ROLES_LIST.SEARCH_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-primary',
        popover: {
          title: this.translate.instant('TOUR.ROLES_LIST.ADD_BUTTON_TITLE'),
          description: this.translate.instant('TOUR.ROLES_LIST.ADD_BUTTON_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.table-responsive',
        popover: {
          title: this.translate.instant('TOUR.ROLES_LIST.TABLE_TITLE'),
          description: this.translate.instant('TOUR.ROLES_LIST.TABLE_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.pagination',
        popover: {
          title: this.translate.instant('TOUR.ROLES_LIST.PAGINATION_TITLE'),
          description: this.translate.instant('TOUR.ROLES_LIST.PAGINATION_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('roles-list');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para el formulario de agregar rol
   */
  startRolesFormTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: this.translate.instant('TOUR.ROLES_FORM.BREADCRUMB_TITLE'),
          description: this.translate.instant('TOUR.ROLES_FORM.BREADCRUMB_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="name"]',
        popover: {
          title: this.translate.instant('TOUR.ROLES_FORM.NAME_TITLE'),
          description: this.translate.instant('TOUR.ROLES_FORM.NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.permissions-section',
        popover: {
          title: this.translate.instant('TOUR.ROLES_FORM.PERMISSIONS_TITLE'),
          description: this.translate.instant('TOUR.ROLES_FORM.PERMISSIONS_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-primary',
        popover: {
          title: this.translate.instant('TOUR.ROLES_FORM.SAVE_TITLE'),
          description: this.translate.instant('TOUR.ROLES_FORM.SAVE_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('roles-form');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para editar rol
   */
  startEditRoleTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.page-header',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ROLE.FORM_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ROLE.FORM_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="name"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ROLE.NAME_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ROLE.NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.permissions-section',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ROLE.PERMISSIONS_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ROLE.PERMISSIONS_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-primary',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ROLE.UPDATE_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ROLE.UPDATE_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('edit-role');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para la lista de staff
   */
  startStaffListTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: this.translate.instant('TOUR.STAFF_LIST.BREADCRUMB_TITLE'),
          description: this.translate.instant('TOUR.STAFF_LIST.BREADCRUMB_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.header-bar',
        popover: {
          title: this.translate.instant('TOUR.STAFF_LIST.HEADER_TITLE'),
          description: this.translate.instant('TOUR.STAFF_LIST.HEADER_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.search-box',
        popover: {
          title: this.translate.instant('TOUR.STAFF_LIST.SEARCH_TITLE'),
          description: this.translate.instant('TOUR.STAFF_LIST.SEARCH_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-options',
        popover: {
          title: this.translate.instant('TOUR.STAFF_LIST.ADD_BUTTON_TITLE'),
          description: this.translate.instant('TOUR.STAFF_LIST.ADD_BUTTON_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.role-filter-box',
        popover: {
          title: this.translate.instant('TOUR.STAFF_LIST.LIST_ROLE_FILTERS_TITLE'),
          description: this.translate.instant('TOUR.STAFF_LIST.LIST_ROLE_FILTERS_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.table-responsive',
        popover: {
          title: this.translate.instant('TOUR.STAFF_LIST.TABLE_TITLE'),
          description: this.translate.instant('TOUR.STAFF_LIST.TABLE_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.pagination',
        popover: {
          title: this.translate.instant('TOUR.STAFF_LIST.PAGINATION_TITLE'),
          description: this.translate.instant('TOUR.STAFF_LIST.PAGINATION_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('staff-list');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para el formulario de agregar staff
   */
  startStaffFormTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: this.translate.instant('TOUR.STAFF_FORM.BREADCRUMB_TITLE'),
          description: this.translate.instant('TOUR.STAFF_FORM.BREADCRUMB_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="name"]',
        popover: {
          title: this.translate.instant('TOUR.STAFF_FORM.NAME_TITLE'),
          description: this.translate.instant('TOUR.STAFF_FORM.NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="surname"]',
        popover: {
          title: this.translate.instant('TOUR.STAFF_FORM.SURNAME_TITLE'),
          description: this.translate.instant('TOUR.STAFF_FORM.SURNAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="email"]',
        popover: {
          title: this.translate.instant('TOUR.STAFF_FORM.EMAIL_TITLE'),
          description: this.translate.instant('TOUR.STAFF_FORM.EMAIL_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'select[name="role"]',
        popover: {
          title: this.translate.instant('TOUR.STAFF_FORM.ROLE_TITLE'),
          description: this.translate.instant('TOUR.STAFF_FORM.ROLE_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="password"]',
        popover: {
          title: this.translate.instant('TOUR.STAFF_FORM.PASSWORD_TITLE'),
          description: this.translate.instant('TOUR.STAFF_FORM.PASSWORD_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="password_confirmation"]',
        popover: {
          title: this.translate.instant('TOUR.STAFF_FORM.PASSWORD_CONFIRMATION_TITLE'),
          description: this.translate.instant('TOUR.STAFF_FORM.PASSWORD_CONFIRMATION_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-save',
        popover: {
          title: this.translate.instant('TOUR.STAFF_FORM.SAVE_TITLE'),
          description: this.translate.instant('TOUR.STAFF_FORM.SAVE_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('staff-form');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para editar staff
   */
  startEditStaffTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.page-header',
        popover: {
          title: this.translate.instant('TOUR.EDIT_STAFF.FORM_TITLE'),
          description: this.translate.instant('TOUR.EDIT_STAFF.FORM_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="name"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_STAFF.NAME_TITLE'),
          description: this.translate.instant('TOUR.EDIT_STAFF.NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="surname"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_STAFF.SURNAME_TITLE'),
          description: this.translate.instant('TOUR.EDIT_STAFF.SURNAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="email"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_STAFF.EMAIL_TITLE'),
          description: this.translate.instant('TOUR.EDIT_STAFF.EMAIL_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'select[name="role"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_STAFF.ROLE_TITLE'),
          description: this.translate.instant('TOUR.EDIT_STAFF.ROLE_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-save',
        popover: {
          title: this.translate.instant('TOUR.EDIT_STAFF.UPDATE_TITLE'),
          description: this.translate.instant('TOUR.EDIT_STAFF.UPDATE_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('edit-staff');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para la lista de áreas de enseñanza
   */
  startAreasListTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: this.translate.instant('TOUR.AREAS_LIST.BREADCRUMB_TITLE'),
          description: this.translate.instant('TOUR.AREAS_LIST.BREADCRUMB_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.search-box',
        popover: {
          title: this.translate.instant('TOUR.AREAS_LIST.SEARCH_TITLE'),
          description: this.translate.instant('TOUR.AREAS_LIST.SEARCH_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-options',
        popover: {
          title: this.translate.instant('TOUR.AREAS_LIST.NEW_BUTTON_TITLE'),
          description: this.translate.instant('TOUR.AREAS_LIST.NEW_BUTTON_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.table-responsive',
        popover: {
          title: this.translate.instant('TOUR.AREAS_LIST.TABLE_TITLE'),
          description: this.translate.instant('TOUR.AREAS_LIST.TABLE_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.5)',
      onDestroyed: () => {
        this.saveTourCompleted('areas-list');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para el formulario de agregar área
   */
  startAreasFormTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: 'Navegación',
          description: 'Muestra tu ubicación actual en el sistema.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="nombre"]',
        popover: {
          title: 'Nombre del Área',
          description: 'Ingresa el nombre del área (Ej: MEDICINA, ENFERMERÍA). Este campo es obligatorio.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="descripcion"]',
        popover: {
          title: 'Descripción',
          description: 'Campo opcional para agregar información adicional sobre el área.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.toggle-wrapper',
        popover: {
          title: 'Estado Activo',
          description: 'Activa o desactiva el área. Solo las áreas activas estarán disponibles en el sistema.',
          side: 'left',
          align: 'center'
        }
      },
      {
        element: '.btn-primary',
        popover: {
          title: 'Guardar Área',
          description: 'Haz clic aquí para guardar el nuevo área. Asegúrate de completar el nombre.',
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('areas-form');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para editar área
   */
  startEditAreaTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: 'Navegación',
          description: 'Estás editando un área existente.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="nombre"]',
        popover: {
          title: 'Nombre del Área',
          description: 'Edita el nombre del área según sea necesario.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="descripcion"]',
        popover: {
          title: 'Descripción',
          description: 'Modifica la descripción del área si es necesario.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.toggle-wrapper',
        popover: {
          title: 'Estado Activo',
          description: 'Cambia el estado del área (activo/inactivo).',
          side: 'left',
          align: 'center'
        }
      },
      {
        element: 'button[type="submit"]',
        popover: {
          title: 'Actualizar Área',
          description: 'Guarda los cambios realizados al área.',
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('edit-area');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para la lista de asistentes
   */
  startAssistantsListTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: this.translate.instant('TOUR.ASSISTANTS_LIST.BREADCRUMB_TITLE'),
          description: this.translate.instant('TOUR.ASSISTANTS_LIST.BREADCRUMB_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.filters-card',
        popover: {
          title: this.translate.instant('TOUR.ASSISTANTS_LIST.FILTERS_TITLE'),
          description: this.translate.instant('TOUR.ASSISTANTS_LIST.FILTERS_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.btn-add-patient',
        popover: {
          title: this.translate.instant('TOUR.ASSISTANTS_LIST.NEW_BUTTON_TITLE'),
          description: this.translate.instant('TOUR.ASSISTANTS_LIST.NEW_BUTTON_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.btn-evaluaciones',
        popover: {
          title: this.translate.instant('TOUR.ASSISTANTS_LIST.EVALUATIONS_BUTTON_TITLE'),
          description: this.translate.instant('TOUR.ASSISTANTS_LIST.EVALUATIONS_BUTTON_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.patients-grid',
        popover: {
          title: this.translate.instant('TOUR.ASSISTANTS_LIST.TABLE_TITLE'),
          description: this.translate.instant('TOUR.ASSISTANTS_LIST.TABLE_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.5)',
      onDestroyed: () => {
        this.saveTourCompleted('assistants-list');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para el formulario de agregar asistente
   */
  startAssistantsFormTour(): void {
    const steps: DriveStep[] = [
      {
        element: 'input[name="nombre"]',
        popover: {
          title: this.translate.instant('TOUR.ASSISTANTS_FORM.NAME_TITLE'),
          description: this.translate.instant('TOUR.ASSISTANTS_FORM.NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'select[name="modalidad_id"]',
        popover: {
          title: this.translate.instant('TOUR.ASSISTANTS_FORM.MODALITY_TITLE'),
          description: this.translate.instant('TOUR.ASSISTANTS_FORM.MODALITY_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-primary',
        popover: {
          title: this.translate.instant('TOUR.ASSISTANTS_FORM.SAVE_TITLE'),
          description: this.translate.instant('TOUR.ASSISTANTS_FORM.SAVE_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('assistants-form');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para editar asistente
   */
  startEditAssistantTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ASSISTANT.BREADCRUMB_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ASSISTANT.BREADCRUMB_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'select[name="profesion"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ASSISTANT.PROFESSION_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ASSISTANT.PROFESSION_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="nombre"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ASSISTANT.NAME_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ASSISTANT.NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="correo"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ASSISTANT.EMAIL_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ASSISTANT.EMAIL_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'select[name="area"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ASSISTANT.AREA_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ASSISTANT.AREA_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="ei"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ASSISTANT.EI_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ASSISTANT.EI_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="ef"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ASSISTANT.EF_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ASSISTANT.EF_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="nombre_evento"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ASSISTANT.EVENT_NAME_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ASSISTANT.EVENT_NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="tema"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ASSISTANT.THEME_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ASSISTANT.THEME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="fecha"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ASSISTANT.DATE_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ASSISTANT.DATE_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'select[name="modalidad_id"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ASSISTANT.MODALITY_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ASSISTANT.MODALITY_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'select[name="participacion_id"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ASSISTANT.PARTICIPATION_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ASSISTANT.PARTICIPATION_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="horas"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ASSISTANT.HOURS_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ASSISTANT.HOURS_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="adscripcion"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ASSISTANT.ADSCRIPTION_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ASSISTANT.ADSCRIPTION_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="foja"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ASSISTANT.FOJA_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ASSISTANT.FOJA_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-save',
        popover: {
          title: this.translate.instant('TOUR.EDIT_ASSISTANT.UPDATE_TITLE'),
          description: this.translate.instant('TOUR.EDIT_ASSISTANT.UPDATE_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('edit-assistant');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para la lista de evaluaciones
   */
  startEvaluationsListTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: this.translate.instant('TOUR.EVALUATIONS_LIST.BREADCRUMB_TITLE'),
          description: this.translate.instant('TOUR.EVALUATIONS_LIST.BREADCRUMB_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.filters-card',
        popover: {
          title: this.translate.instant('TOUR.EVALUATIONS_LIST.FILTERS_TITLE'),
          description: this.translate.instant('TOUR.EVALUATIONS_LIST.FILTERS_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.card-list',
        popover: {
          title: this.translate.instant('TOUR.EVALUATIONS_LIST.STATS_TITLE'),
          description: this.translate.instant('TOUR.EVALUATIONS_LIST.STATS_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.action-buttons-compact',
        popover: {
          title: this.translate.instant('TOUR.EVALUATIONS_LIST.PERMISSIONS_TITLE'),
          description: this.translate.instant('TOUR.EVALUATIONS_LIST.PERMISSIONS_DESC'),
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.btn-add-evaluations',
        popover: {
          title: this.translate.instant('TOUR.EVALUATIONS_LIST.NEW_BUTTON_TITLE'),
          description: this.translate.instant('TOUR.EVALUATIONS_LIST.NEW_BUTTON_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.5)',
      onDestroyed: () => {
        this.saveTourCompleted('evaluations-list');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para el formulario de agregar evaluación
   */
  startEvaluationsFormTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: this.translate.instant('TOUR.EVALUATIONS_FORM.BREADCRUMB_TITLE'),
          description: this.translate.instant('TOUR.EVALUATIONS_FORM.BREADCRUMB_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="nombre"]',
        popover: {
          title: this.translate.instant('TOUR.EVALUATIONS_FORM.NAME_TITLE'),
          description: this.translate.instant('TOUR.EVALUATIONS_FORM.NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'select[name="especialidad"]',
        popover: {
          title: this.translate.instant('TOUR.EVALUATIONS_FORM.SPECIALTY_TITLE'),
          description: this.translate.instant('TOUR.EVALUATIONS_FORM.SPECIALTY_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="fecha_inicio"]',
        popover: {
          title: this.translate.instant('TOUR.EVALUATIONS_FORM.START_DATE_TITLE'),
          description: this.translate.instant('TOUR.EVALUATIONS_FORM.START_DATE_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="fecha_limite"]',
        popover: {
          title: this.translate.instant('TOUR.EVALUATIONS_FORM.DEADLINE_TITLE'),
          description: this.translate.instant('TOUR.EVALUATIONS_FORM.DEADLINE_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'select[name="estado"]',
        popover: {
          title: this.translate.instant('TOUR.EVALUATIONS_FORM.STATUS_TITLE'),
          description: this.translate.instant('TOUR.EVALUATIONS_FORM.STATUS_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'textarea[name="observaciones"]',
        popover: {
          title: this.translate.instant('TOUR.EVALUATIONS_FORM.OBSERVATIONS_TITLE'),
          description: this.translate.instant('TOUR.EVALUATIONS_FORM.OBSERVATIONS_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-save',
        popover: {
          title: this.translate.instant('TOUR.EVALUATIONS_FORM.SAVE_TITLE'),
          description: this.translate.instant('TOUR.EVALUATIONS_FORM.SAVE_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('evaluations-form');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para editar evaluación
   */
  startEditEvaluationTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: this.translate.instant('TOUR.EDIT_EVALUATION.BREADCRUMB_TITLE'),
          description: this.translate.instant('TOUR.EDIT_EVALUATION.BREADCRUMB_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="nombre"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_EVALUATION.NAME_TITLE'),
          description: this.translate.instant('TOUR.EDIT_EVALUATION.NAME_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="especialidad"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_EVALUATION.SPECIALTY_TITLE'),
          description: this.translate.instant('TOUR.EDIT_EVALUATION.SPECIALTY_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="fecha_inicio"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_EVALUATION.START_DATE_TITLE'),
          description: this.translate.instant('TOUR.EDIT_EVALUATION.START_DATE_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="fecha_limite"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_EVALUATION.DEADLINE_TITLE'),
          description: this.translate.instant('TOUR.EDIT_EVALUATION.DEADLINE_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'select[name="estado"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_EVALUATION.STATUS_TITLE'),
          description: this.translate.instant('TOUR.EDIT_EVALUATION.STATUS_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'textarea[name="observaciones"]',
        popover: {
          title: this.translate.instant('TOUR.EDIT_EVALUATION.OBSERVATIONS_TITLE'),
          description: this.translate.instant('TOUR.EDIT_EVALUATION.OBSERVATIONS_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-save',
        popover: {
          title: this.translate.instant('TOUR.EDIT_EVALUATION.UPDATE_TITLE'),
          description: this.translate.instant('TOUR.EDIT_EVALUATION.UPDATE_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('edit-evaluation');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para la lista de modalidades
   */
  startModalitiesListTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: this.translate.instant('TOUR.MODALITIES_LIST.BREADCRUMB_TITLE'),
          description: this.translate.instant('TOUR.MODALITIES_LIST.BREADCRUMB_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.search-box',
        popover: {
          title: this.translate.instant('TOUR.MODALITIES_LIST.SEARCH_TITLE'),
          description: this.translate.instant('TOUR.MODALITIES_LIST.SEARCH_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-options',
        popover: {
          title: this.translate.instant('TOUR.MODALITIES_LIST.NEW_BUTTON_TITLE'),
          description: this.translate.instant('TOUR.MODALITIES_LIST.NEW_BUTTON_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.table-responsive',
        popover: {
          title: this.translate.instant('TOUR.MODALITIES_LIST.TABLE_TITLE'),
          description: this.translate.instant('TOUR.MODALITIES_LIST.TABLE_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.5)',
      onDestroyed: () => {
        this.saveTourCompleted('modalities-list');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para el formulario de agregar modalidad
   */
  startModalitiesFormTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: 'Navegación',
          description: 'Muestra tu ubicación en el módulo de enseñanza.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="codigo"]',
        popover: {
          title: 'Código',
          description: 'Ingresa el código único de la modalidad (Ej: CAP.LOC.M). Este campo es obligatorio.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="nombre"]',
        popover: {
          title: 'Nombre',
          description: 'Ingresa el nombre descriptivo de la modalidad. Este campo es obligatorio.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.toggle-wrapper',
        popover: {
          title: 'Estado Activo',
          description: 'Activa o desactiva la modalidad. Solo las modalidades activas estarán disponibles.',
          side: 'left',
          align: 'center'
        }
      },
      {
        element: '.btn-primary',
        popover: {
          title: 'Guardar Modalidad',
          description: 'Haz clic aquí para guardar la nueva modalidad. Asegúrate de completar código y nombre.',
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('modalities-form');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para editar modalidad
   */
  startEditModalityTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: 'Navegación',
          description: 'Estás editando una modalidad existente.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="codigo"]',
        popover: {
          title: 'Código',
          description: 'Edita el código de la modalidad si es necesario.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="nombre"]',
        popover: {
          title: 'Nombre',
          description: 'Edita el nombre de la modalidad según sea necesario.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.toggle-wrapper',
        popover: {
          title: 'Estado Activo',
          description: 'Cambia el estado de la modalidad (activo/inactivo).',
          side: 'left',
          align: 'center'
        }
      },
      {
        element: '.btn-primary',
        popover: {
          title: 'Actualizar Modalidad',
          description: 'Guarda los cambios realizados a la modalidad.',
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('edit-modality');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para la lista de participaciones
   */
  startStakeholdingsListTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: this.translate.instant('TOUR.STAKEHOLDINGS_LIST.BREADCRUMB_TITLE'),
          description: this.translate.instant('TOUR.STAKEHOLDINGS_LIST.BREADCRUMB_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.search-box',
        popover: {
          title: this.translate.instant('TOUR.STAKEHOLDINGS_LIST.SEARCH_TITLE'),
          description: this.translate.instant('TOUR.STAKEHOLDINGS_LIST.SEARCH_DESC'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.btn-options',
        popover: {
          title: this.translate.instant('TOUR.STAKEHOLDINGS_LIST.NEW_BUTTON_TITLE'),
          description: this.translate.instant('TOUR.STAKEHOLDINGS_LIST.NEW_BUTTON_DESC'),
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.table-responsive',
        popover: {
          title: this.translate.instant('TOUR.STAKEHOLDINGS_LIST.TABLE_TITLE'),
          description: this.translate.instant('TOUR.STAKEHOLDINGS_LIST.TABLE_DESC'),
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.5)',
      onDestroyed: () => {
        this.saveTourCompleted('stakeholdings-list');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para el formulario de agregar participación
   */
  startStakeholdingsFormTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: 'Navegación',
          description: 'Muestra tu ubicación en el módulo de enseñanza.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="nombre"]',
        popover: {
          title: 'Nombre de Participación',
          description: 'Ingresa el nombre del tipo de participación. Este campo es obligatorio.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.toggle-wrapper',
        popover: {
          title: 'Estado Activo',
          description: 'Activa o desactiva el tipo de participación. Solo los activos estarán disponibles.',
          side: 'left',
          align: 'center'
        }
      },
      {
        element: '.btn-primary',
        popover: {
          title: 'Guardar Participación',
          description: 'Haz clic aquí para guardar el nuevo tipo de participación.',
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('stakeholdings-form');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Tour para editar participación
   */
  startEditStakeholdingTour(): void {
    const steps: DriveStep[] = [
      {
        element: '.breadcrumb',
        popover: {
          title: 'Navegación',
          description: 'Estás editando un tipo de participación existente.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'input[name="nombre"]',
        popover: {
          title: 'Nombre de Participación',
          description: 'Edita el nombre del tipo de participación según sea necesario.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.toggle-wrapper',
        popover: {
          title: 'Estado Activo',
          description: 'Cambia el estado del tipo de participación (activo/inactivo).',
          side: 'left',
          align: 'center'
        }
      },
      {
        element: '.btn-primary',
        popover: {
          title: 'Actualizar Participación',
          description: 'Guarda los cambios realizados al tipo de participación.',
          side: 'top',
          align: 'center'
        }
      }
    ];

    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: this.translate.instant('TOUR.NEXT'),
      prevBtnText: this.translate.instant('TOUR.PREVIOUS'),
      doneBtnText: this.translate.instant('TOUR.DONE'),
      progressText: this.translate.instant('TOUR.PROGRESS'),
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driver-popover-custom',
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.4)',
      onDestroyed: () => {
        this.saveTourCompleted('edit-stakeholding');
      }
    };

    this.driverInstance = driver(config);
    this.driverInstance.setSteps(steps);
    this.driverInstance.drive();
  }

  /**
   * Destruye la instancia actual del driver
   */
  destroy(): void {
    if (this.driverInstance) {
      this.driverInstance.destroy();
    }
  }
}
