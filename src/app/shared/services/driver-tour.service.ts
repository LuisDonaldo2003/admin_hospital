import { Injectable } from '@angular/core';
import { driver, DriveStep, Config } from 'driver.js';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class DriverTourService {
  private driverInstance: any;

  constructor(private translate: TranslateService) {}

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
   * Tour para el formulario de agregar/editar archivo médico
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
      // Botón ir al listado
      {
        element: '.btn-outline-secondary',
        popover: {
          title: this.translate.instant('TOUR.ARCHIVE_FORM.GO_TO_LIST_TITLE'),
          description: this.translate.instant('TOUR.ARCHIVE_FORM.GO_TO_LIST_DESC'),
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
   * Destruye la instancia actual del driver
   */
  destroy(): void {
    if (this.driverInstance) {
      this.driverInstance.destroy();
    }
  }
}
