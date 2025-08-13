import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import { ArchiveService } from '../../archive/service/archive.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import {ApexAxisChartSeries,ApexChart,ApexDataLabels,ApexStroke,ApexXAxis,ApexYAxis,ApexGrid,ApexTooltip,ApexFill} from 'ng-apexcharts';
import { TranslateModule,TranslateService } from '@ngx-translate/core';

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

  /**
   * Inyecta el servicio de archivos y traducción
   */
  constructor(
    private archiveService: ArchiveService,
    private translate: TranslateService,
  ) {}

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
   * Formatea una fecha ISO a formato corto (dd/mm)
   */
  private formatShortDate(iso: string) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' });
  }
}
