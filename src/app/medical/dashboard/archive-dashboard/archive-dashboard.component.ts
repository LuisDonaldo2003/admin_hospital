import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import { ArchiveService } from '../../archive/service/archive.service';
import { PermissionService } from 'src/app/shared/services/permission.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexStroke, ApexXAxis, ApexYAxis, ApexGrid, ApexTooltip, ApexFill } from 'ng-apexcharts';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-archive-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NgApexchartsModule, TranslateModule],
  templateUrl: './archive-dashboard.component.html',
  styleUrls: ['./archive-dashboard.component.scss']
})
export class ArchiveDashboardComponent implements OnInit {
  // Rutas globales para navegación
  routes = routes;
  // Fecha actual para mostrar en dashboard
  todayDate = new Date();
  currentYear = new Date().getFullYear();
  // Estadísticas principales (KPI)
  stats = {
    todayAdded: 0,
    weekAdded: 0,
    monthAdded: 0,
    totalArchives: 0,
  };
  // Estado de carga de datos
  loading = true;
  // Mensaje de error si ocurre
  error: string | null = null;

  // Estadísticas por género
  byGender = { male: 0, female: 0 };
  // Estadísticas por estado/localidad
  byState: Array<{ state: string; count: number }> = [];

  // Datos para el gráfico de los últimos 7 días
  weeklyCategories: string[] = [];
  weeklyCounts: number[] = [];
  weeklyChart: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    stroke: ApexStroke;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    grid: ApexGrid;
    tooltip: ApexTooltip;
    fill: ApexFill;
  } | null = null;

  // Datos para gráfico mensual (año actual) y totales anuales
  monthlyChart: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    stroke: ApexStroke;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    grid: ApexGrid;
    tooltip: ApexTooltip;
    fill: ApexFill;
  } | null = null;
  yearlyCounts: Array<{ year: number; count: number }> = [];
  yearlyMax = 0;

  // Servicio de permisos
  public permissionService = inject(PermissionService);

  /**
   * Inyecta el servicio de archivos y traducción
   */
  constructor(
    private archiveService: ArchiveService,
    private translate: TranslateService,
  ) { }

  /**
   * Inicializa el dashboard cargando las estadísticas
   */
  ngOnInit(): void { this.loadStats(); }

  /**
   * Carga las estadísticas del backend y prepara los datos para los KPIs y gráficos
   */
  loadStats() {
    this.loading = true;
    this.archiveService.getArchiveStats().subscribe({
      next: (res: any) => {
        if (res?.stats) {
          this.stats = res.stats;
        }
        if (res?.byGender) {
          this.byGender = res.byGender;
        }
        if (res?.topLocations) {
          this.byState = res.topLocations.map((l: any) => ({ state: l.name, count: l.count }));
        }
        // Obtiene la serie diaria para el gráfico (según el nombre que envíe el backend)
        const rawDaily = res?.dailySeries || res?.dailyTrend || res?.last7Days || res?.daily || null;
        this.prepareWeeklyChart(rawDaily);

        // Nuevos datos: mensual y anual
        this.prepareMonthlyChart(res?.monthlyCounts || res?.perMonth || null);
        this.yearlyCounts = Array.isArray(res?.yearlyCounts) ? [...res.yearlyCounts].sort((a: any, b: any) => a.year - b.year) : [];
        this.yearlyMax = this.yearlyCounts.length ? Math.max(...this.yearlyCounts.map(y => Number(y.count || 0))) : 0;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error cargando estadísticas';
        this.loading = false;
      }
    });
  }

  /**
   * Prepara los datos para el gráfico de los últimos 7 días
   */
  private prepareWeeklyChart(raw: any) {
    // raw esperado: array de objetos {date: 'YYYY-MM-DD', count: number}
    const today = new Date();
    const last7: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().substring(0, 10);
      last7.push({ date: iso, count: 0 });
    }
    if (Array.isArray(raw)) {
      raw.forEach((r: any) => {
        const key = (r.date || r.day || r.fecha || '').toString().substring(0, 10);
        const found = last7.find(x => x.date === key);
        if (found) {
          found.count = Number(r.count || r.total || r.value || 0);
        }
      });
    }
    this.weeklyCategories = last7.map(d => this.formatShortDate(d.date));
    this.weeklyCounts = last7.map(d => d.count);
    this.weeklyChart = {
      series: [
        {
          name: 'Registros',
          data: this.weeklyCounts
        }
      ],
      chart: { type: 'area', height: 240, sparkline: { enabled: false }, toolbar: { show: false }, animations: { enabled: true } },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      xaxis: {
        categories: this.weeklyCategories,
        labels: { style: { colors: '#8fa2c2', fontSize: '11px' } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: { labels: { style: { colors: '#8fa2c2', fontSize: '11px' } }, forceNiceScale: true, min: 0 },
      grid: { borderColor: 'rgba(255,255,255,0.06)', strokeDashArray: 4, xaxis: { lines: { show: false } } },
      tooltip: { theme: 'dark', x: { show: true }, y: { formatter: (v) => v + ' pacientes' } },
      fill: { type: 'gradient', gradient: { shadeIntensity: 0.4, opacityFrom: 0.35, opacityTo: 0, stops: [0, 100] } }
    };
  }

  /**
   * Prepara la gráfica de conteos por mes del año actual
   * raw esperado: [{year:number, month:1-12, count:number}]
   */
  private prepareMonthlyChart(raw: any) {
    const now = new Date();
    const year = now.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const dataMap = new Map<number, number>();
    if (Array.isArray(raw)) {
      raw.forEach((r: any) => {
        const y = Number(r.year ?? r.y);
        const m = Number(r.month ?? r.m ?? r.month_number);
        if (y === year && m >= 1 && m <= 12) {
          dataMap.set(m, Number(r.count ?? r.total ?? 0));
        }
      });
    }
    const counts = months.map((m) => dataMap.get(m) ?? 0);
    const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    this.monthlyChart = {
      series: [{ name: 'Pacientes', data: counts }],
      chart: { type: 'bar', height: 240, toolbar: { show: false }, animations: { enabled: true } },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      xaxis: { categories: labels, labels: { style: { colors: '#8fa2c2', fontSize: '11px' } } },
      yaxis: { labels: { style: { colors: '#8fa2c2', fontSize: '11px' } }, min: 0 },
      grid: { borderColor: 'rgba(255,255,255,0.06)', strokeDashArray: 4 },
      tooltip: { theme: 'dark', x: { show: true }, y: { formatter: (v) => v + ' pacientes' } },
      fill: { type: 'gradient', gradient: { shadeIntensity: 0.3, opacityFrom: 0.3, opacityTo: 0, stops: [0, 100] } }
    };
  }

  // Porcentaje de un conteo respecto al máximo anual (para barra visual)
  yearPercent(count: number) {
    const max = this.yearlyMax || 1;
    const pct = Math.round((Number(count || 0) / max) * 100);
    return Math.max(0, Math.min(100, pct));
  }

  /**
   * Formatea una fecha ISO a formato corto (dd/mm)
   */
  private formatShortDate(iso: string) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' });
  }

  /**
   * Verifica si el usuario puede agregar expedientes
   */
  canAdd(): boolean {
    return this.permissionService.hasPermission('add_archive');
  }

  /**
   * Verifica si el usuario puede exportar expedientes
   */
  canExport(): boolean {
    return this.permissionService.hasPermission('export_archive');
  }

  /**
   * Verifica si el usuario puede hacer respaldos
   */
  canBackup(): boolean {
    return this.permissionService.hasPermission('backup_archive');
  }
}
