import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import { UserActivityLogsService } from 'src/app/shared/services/user-activity-logs.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import {ApexAxisChartSeries,ApexChart,ApexDataLabels,ApexStroke,ApexXAxis,ApexYAxis,ApexGrid,ApexTooltip,ApexFill,ApexPlotOptions} from 'ng-apexcharts';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-activity-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NgApexchartsModule, TranslateModule, FormsModule],
  templateUrl: './user-activity-dashboard.component.html',
  styleUrls: ['./user-activity-dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserActivityDashboardComponent implements OnInit {
  // Rutas globales para navegación
  routes = routes;
  // Fecha actual para mostrar en dashboard
  todayDate = new Date();
  currentYear = new Date().getFullYear();
  
  // Estadísticas principales (KPI)
  stats = {
    todayActivities: 0,
    weekActivities: 0,
    monthActivities: 0,
    totalActivities: 0,
    activeUsers: 0,
    mostActiveUser: ''
  };
  
  // Estado de carga de datos
  loading = true;
  // Mensaje de error si ocurre
  error: string | null = null;

  // Actividades recientes
  recentActivities: any[] = [];
  
  // Estadísticas por usuario
  activitiesByUser: Array<{ user_name: string; count: number; role: string }> = [];
  
  // Estadísticas por módulo
  activitiesByModule: Array<{ module: string; count: number }> = [];
  
  // Estadísticas por tipo de acción
  activitiesByAction: Array<{ action_type: string; count: number; color: string }> = [];
  
  // Actividades separadas por tipo
  separatedActivities = {
    CREATE: [] as any[],
    READ: [] as any[],
    UPDATE: [] as any[],
    DELETE: [] as any[]
  };
  
  // Estadísticas de tipos de actividad
  activityTypeStats = {
    CREATE: { count: 0, percentage: 0, color: '#28a745' },
    READ: { count: 0, percentage: 0, color: '#17a2b8' },
    UPDATE: { count: 0, percentage: 0, color: '#ffc107' },
    DELETE: { count: 0, percentage: 0, color: '#dc3545' }
  };

  // Usuarios más activos por cada actividad
  mostActiveUsersByAction = {
    CREATE: [] as any[],
    READ: [] as any[],
    UPDATE: [] as any[],
    DELETE: [] as any[]
  };

  // Usuarios más activos
  mostActiveUsers: Array<{ user_name: string; count: number; role: string; last_activity: string }> = [];

  // Datos de actividades por hora del día (calculados)
  get hourlyStats() {
    const hourlyData = this.calculateHourlyActivities();
    

    
    return [
      {h: '00-06', label: 'Madrugada', count: hourlyData.dawn, icon: 'fa-moon'},
      {h: '06-12', label: 'Mañana', count: hourlyData.morning, icon: 'fa-sun'},
      {h: '12-18', label: 'Tarde', count: hourlyData.afternoon, icon: 'fa-cloud-sun'},
      {h: '18-24', label: 'Noche', count: hourlyData.night, icon: 'fa-moon'}
    ];
  }

  // Función para calcular actividades por franja horaria
  calculateHourlyActivities() {
    const counts = { dawn: 0, morning: 0, afternoon: 0, night: 0 };
    const today = new Date();
    
    // Analizar actividades recientes para obtener las horas, pero solo las de hoy
    this.recentActivities.forEach(activity => {
      try {
        const activityDate = new Date(activity.created_at);
        
        // Verificar si es una fecha válida
        if (isNaN(activityDate.getTime())) {
          console.warn('Fecha inválida:', activity.created_at);
          return;
        }
        
        // Comparar solo año, mes y día (ignorar hora para la comparación de fecha)
        const isToday = activityDate.getFullYear() === today.getFullYear() &&
                       activityDate.getMonth() === today.getMonth() &&
                       activityDate.getDate() === today.getDate();
        
        // Solo contar actividades del día de hoy
        if (isToday) {
          const hour = activityDate.getHours();
          
          if (hour >= 0 && hour < 6) {
            counts.dawn++;
          } else if (hour >= 6 && hour < 12) {
            counts.morning++;
          } else if (hour >= 12 && hour < 18) {
            counts.afternoon++;
          } else if (hour >= 18 && hour < 24) {
            counts.night++;
          }
        }
      } catch (error) {
        console.error('Error procesando actividad:', activity, error);
      }
    });
    
    return counts;
  }

  // Filtros para actividades
  filters = {
    action_type: '',
    module: '',
    date_from: '',
    date_to: '',
    search: ''
  };

  // Datos para el gráfico de actividades diarias
  dailyChart: {
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

  // Datos para gráfico de actividades por módulo
  moduleChart: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    grid: ApexGrid;
    tooltip: ApexTooltip;
    fill: ApexFill;
    stroke: ApexStroke;
  } | null = null;

  // Opciones de tipo de acción
  actionTypes = [
    { value: '', label: 'Todos los tipos' },
    { value: 'create', label: 'Crear' },
    { value: 'read', label: 'Ver' },
    { value: 'update', label: 'Editar' },
    { value: 'delete', label: 'Eliminar' },
    { value: 'login', label: 'Iniciar sesión' },
    { value: 'logout', label: 'Cerrar sesión' },
    { value: 'export', label: 'Exportar' },
    { value: 'import', label: 'Importar' }
  ];

  // Opciones de módulos
  moduleOptions = [
    { value: '', label: 'Todos los módulos' },
    { value: 'archive', label: 'Archivo' },
    { value: 'users', label: 'Usuarios' },
    { value: 'reports', label: 'Reportes' },
    { value: 'config', label: 'Configuración' },
    { value: 'backup', label: 'Respaldos' }
  ];

  constructor(
    private userActivityService: UserActivityLogsService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void { 
    this.loadStats(); 
    this.loadRecentActivities();
  }

  /**
   * Carga las estadísticas del dashboard
   */
  loadStats() {
    this.loading = true;
    this.userActivityService.getActivityStats().subscribe({
      next: (res: any) => {
        if (res?.stats) {
          this.stats = res.stats;
        }
        
        // Cargar datos adicionales
        this.loadActivitiesByUser();
        this.loadActivitiesByModule();
        this.loadActivitiesByAction();
        this.loadMostActiveUsers();
        
        // Preparar gráficos
        this.prepareDailyChart(res?.dailySeries || []);
        
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error cargando estadísticas';
        this.loading = false;
      }
    });
  }

  /**
   * Carga las actividades recientes
   */
  loadRecentActivities() {
    this.userActivityService.getRecentActivities(this.filters, 0, 100).subscribe({
      next: (res: any) => {
        this.recentActivities = res?.activities || res?.data || [];
        this.processSeparatedActivities();
      },
      error: (err) => {
        console.error('Error loading recent activities:', err);
      }
    });
  }

  /**
   * Carga estadísticas por usuario
   */
  loadActivitiesByUser() {
    this.userActivityService.getActivitiesByUser().subscribe({
      next: (res: any) => {
        this.activitiesByUser = res?.data || [];
      },
      error: (err) => {
        console.error('Error loading activities by user:', err);
      }
    });
  }

  /**
   * Carga estadísticas por módulo
   */
  loadActivitiesByModule() {
    this.userActivityService.getActivitiesByModule().subscribe({
      next: (res: any) => {
        this.activitiesByModule = res?.data || [];
        this.prepareModuleChart();
      },
      error: (err) => {
        console.error('Error loading activities by module:', err);
      }
    });
  }

  /**
   * Carga estadísticas por tipo de acción
   */
  loadActivitiesByAction() {
    this.userActivityService.getActivitiesByActionType().subscribe({
      next: (res: any) => {
        this.activitiesByAction = (res?.data || []).map((item: any, index: number) => ({
          ...item,
          color: this.getActionColor(item.action_type, index)
        }));
      },
      error: (err) => {
        console.error('Error loading activities by action:', err);
      }
    });
  }

  /**
   * Carga los usuarios más activos
   */
  loadMostActiveUsers() {
    this.userActivityService.getMostActiveUsers(10).subscribe({
      next: (res: any) => {
        this.mostActiveUsers = res?.data || [];
      },
      error: (err) => {
        console.error('Error loading most active users:', err);
      }
    });
  }

  /**
   * Prepara el gráfico de actividades diarias
   */
  private prepareDailyChart(rawData: any[]) {
    const today = new Date();
    const last7: { date: string; count: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().substring(0, 10);
      last7.push({ date: iso, count: 0 });
    }
    
    if (Array.isArray(rawData)) {
      rawData.forEach((r: any) => {
        const key = (r.date || r.day || r.fecha || '').toString().substring(0, 10);
        const found = last7.find(x => x.date === key);
        if (found) {
          found.count = Number(r.count || r.total || r.value || 0);
        }
      });
    }
    
    const categories = last7.map(d => this.formatShortDate(d.date));
    const counts = last7.map(d => d.count);
    
    this.dailyChart = {
      series: [{
        name: 'Actividades',
        data: counts
      }],
      chart: { 
        type: 'area', 
        height: 280, 
        sparkline: { enabled: false }, 
        toolbar: { show: false }, 
        animations: { 
          enabled: true,
          speed: 600
        },
        background: 'transparent',
        foreColor: '#495057'
      },
      dataLabels: { 
        enabled: false
      },
      stroke: { 
        curve: 'smooth', 
        width: 3,
        colors: ['#3498db']
      },
      xaxis: {
        categories: categories,
        labels: { 
          style: { 
            colors: Array(categories.length).fill('#6c757d'), 
            fontSize: '12px',
            fontWeight: 400
          } 
        },
        axisBorder: { 
          show: true,
          color: '#dee2e6'
        },
        axisTicks: { 
          show: true,
          color: '#dee2e6'
        }
      },
      yaxis: { 
        labels: { 
          style: { 
            colors: ['#6c757d'], 
            fontSize: '12px',
            fontWeight: 400
          } 
        }, 
        forceNiceScale: true, 
        min: 0 
      },
      grid: { 
        borderColor: '#e9ecef', 
        strokeDashArray: 2, 
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } }
      },
      tooltip: { 
        theme: 'light',
        style: {
          fontSize: '12px',
          fontFamily: 'Segoe UI, sans-serif'
        },
        x: { show: true }, 
        y: { formatter: (v) => v + ' actividades' },
        marker: {
          show: true
        }
      },
      fill: { 
        type: 'gradient', 
        gradient: { 
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.3, 
          gradientToColors: ['rgba(52, 152, 219, 0.1)'],
          opacityFrom: 0.5, 
          opacityTo: 0.1, 
          stops: [0, 100]
        } 
      }
    };
  }

  /**
   * Prepara el gráfico de actividades por módulo
   */
  private prepareModuleChart() {
    if (!this.activitiesByModule.length) return;
    
    const moduleNames = this.activitiesByModule.map(m => m.module);
    const moduleCounts = this.activitiesByModule.map(m => m.count);
    
    this.moduleChart = {
      series: [{
        name: 'Actividades',
        data: moduleCounts
      }],
      chart: { 
        type: 'bar', 
        height: 320, 
        toolbar: { show: false }, 
        animations: { 
          enabled: true,
          speed: 600
        },
        background: 'transparent',
        foreColor: '#495057'
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4,
          borderRadiusApplication: 'end',
          barHeight: '60%',
          dataLabels: {
            position: 'top'
          }
        }
      },
      dataLabels: { 
        enabled: true,
        style: {
          colors: ['#ffffff'],
          fontWeight: 600,
          fontSize: '11px'
        }
      },
      stroke: { 
        width: 0
      },
      xaxis: {
        categories: moduleNames,
        labels: { 
          style: { 
            colors: Array(moduleNames.length).fill('#6c757d'), 
            fontSize: '12px',
            fontWeight: 400
          } 
        },
        axisBorder: { 
          show: true,
          color: '#dee2e6'
        },
        axisTicks: { 
          show: true,
          color: '#dee2e6'
        }
      },
      yaxis: { 
        labels: { 
          style: { 
            colors: ['#6c757d'], 
            fontSize: '12px',
            fontWeight: 400
          } 
        }
      },
      grid: { 
        borderColor: '#e9ecef', 
        strokeDashArray: 2,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } }
      },
      tooltip: { 
        theme: 'light',
        style: {
          fontSize: '12px',
          fontFamily: 'Segoe UI, sans-serif'
        },
        y: { formatter: (v) => v + ' actividades' },
        marker: {
          show: true
        }
      },
      fill: { 
        type: 'gradient', 
        gradient: { 
          shade: 'light',
          type: 'horizontal',
          shadeIntensity: 0.2,
          gradientToColors: ['#2980b9'], 
          opacityFrom: 0.8, 
          opacityTo: 0.6, 
          stops: [0, 100]
        },
        colors: ['#3498db']
      }
    };
  }

  /**
   * Aplica filtros a las actividades
   */
  applyFilters() {
    this.loadRecentActivities();
  }

  /**
   * Limpia todos los filtros
   */
  clearFilters() {
    this.filters = {
      action_type: '',
      module: '',
      date_from: '',
      date_to: '',
      search: ''
    };
    this.loadRecentActivities();
  }

  /**
   * Obtiene el color para un tipo de acción
   */
  private getActionColor(actionType: string, index: number): string {
    const colors = {
      'create': '#28a745',
      'read': '#17a2b8',
      'update': '#ffc107',
      'delete': '#dc3545',
      'login': '#007bff',
      'logout': '#6c757d',
      'export': '#e83e8c',
      'import': '#20c997'
    };
    return (colors as any)[actionType] || ['#6f42c1', '#fd7e14', '#e83e8c'][index % 3];
  }

  /**
   * Formatea una fecha ISO a formato corto (dd/mm)
   */
  private formatShortDate(iso: string) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' });
  }

  /**
   * Formatea una fecha para mostrar
   */
  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Obtiene la etiqueta del tipo de acción
   */
  getActionTypeLabel(actionType: string): string {
    const action = this.actionTypes.find(a => a.value === actionType);
    return action ? action.label : actionType;
  }

  /**
   * Obtiene la etiqueta del módulo
   */
  getModuleLabel(module: string): string {
    const mod = this.moduleOptions.find(m => m.value === module);
    return mod ? mod.label : module;
  }

  /**
   * Obtiene el ícono para un tipo de acción
   */
  getActionIcon(actionType: string): string {
    const icons = {
      'create': 'fa-plus',
      'read': 'fa-eye',
      'update': 'fa-edit',
      'delete': 'fa-trash',
      'login': 'fa-sign-in-alt',
      'logout': 'fa-sign-out-alt',
      'export': 'fa-download',
      'import': 'fa-upload'
    };
    return (icons as any)[actionType] || 'fa-cog';
  }

  /**
   * Obtiene la clase CSS para un tipo de acción
   */
  getActionClass(actionType: string): string {
    const classes = {
      'create': 'badge-success',
      'read': 'badge-info',
      'update': 'badge-warning',
      'delete': 'badge-danger',
      'login': 'badge-primary',
      'logout': 'badge-secondary',
      'export': 'badge-purple',
      'import': 'badge-teal'
    };
    return (classes as any)[actionType] || 'badge-secondary';
  }

  /**
   * Procesa las actividades separándolas por tipo
   */
  processSeparatedActivities() {
    // Reiniciar datos
    this.separatedActivities = {
      CREATE: [],
      READ: [],
      UPDATE: [],
      DELETE: []
    };

    this.activityTypeStats = {
      CREATE: { count: 0, percentage: 0, color: '#28a745' },
      READ: { count: 0, percentage: 0, color: '#17a2b8' },
      UPDATE: { count: 0, percentage: 0, color: '#ffc107' },
      DELETE: { count: 0, percentage: 0, color: '#dc3545' }
    };

    // Separar actividades por tipo
    this.recentActivities.forEach(activity => {
      const actionType = activity.action_type?.toUpperCase();
      if (this.separatedActivities[actionType as keyof typeof this.separatedActivities]) {
        this.separatedActivities[actionType as keyof typeof this.separatedActivities].push(activity);
        this.activityTypeStats[actionType as keyof typeof this.activityTypeStats].count++;
      }
    });

    // Calcular porcentajes
    const total = this.recentActivities.length;
    if (total > 0) {
      Object.keys(this.activityTypeStats).forEach(key => {
        const typedKey = key as keyof typeof this.activityTypeStats;
        this.activityTypeStats[typedKey].percentage = 
          Math.round((this.activityTypeStats[typedKey].count / total) * 100);
      });
    }

    // Procesar usuarios más activos por tipo
    this.processMostActiveUsersByAction();
  }

  /**
   * Procesa los usuarios más activos por tipo de acción
   */
  processMostActiveUsersByAction() {
    Object.keys(this.separatedActivities).forEach(actionType => {
      const activities = this.separatedActivities[actionType as keyof typeof this.separatedActivities];
      const userCounts: { [key: string]: { count: number; user_name: string; role: string } } = {};

      activities.forEach(activity => {
        const userName = activity.user_name;
        if (!userCounts[userName]) {
          userCounts[userName] = {
            count: 0,
            user_name: userName,
            role: activity.role || 'Usuario'
          };
        }
        userCounts[userName].count++;
      });

      this.mostActiveUsersByAction[actionType as keyof typeof this.mostActiveUsersByAction] = 
        Object.values(userCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
    });
  }

  /**
   * Obtiene el porcentaje de una actividad específica
   */
  getActivityPercentage(actionType: string): number {
    return this.activityTypeStats[actionType as keyof typeof this.activityTypeStats]?.percentage || 0;
  }

  /**
   * Obtiene el color de una actividad específica
   */
  getActivityColor(actionType: string): string {
    return this.activityTypeStats[actionType as keyof typeof this.activityTypeStats]?.color || '#6c757d';
  }
}
