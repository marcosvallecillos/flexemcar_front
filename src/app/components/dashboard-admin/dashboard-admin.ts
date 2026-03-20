import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../services/api-service.service';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { Reserva, Usuario } from '../../models/user.interface';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, catchError, of } from 'rxjs';
import jsPDF from 'jspdf';
@Component({
  selector: 'app-dashboard-admin',
  imports: [ DatePipe, FormsModule],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.css',
})
export class DashboardAdmin implements OnInit, AfterViewInit {
  @ViewChild('areaChart') areaChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;

  usuarios: Usuario[] = [];
  reservas: Reserva[] = [];
  reservasActivas: Reserva[] = [];
  reservasExpiradas: Reserva[] = [];

  totalUsuarios = 0;
  totalReservas = 0;
  totalActivas = 0;
  ingresosMes = 0;

  currentDate = new Date();
  loading = true;

  // Datos guardados para hit-test en hover
  private areaLabels: string[] = [];
  private areaData: number[] = [];
  private barChartBars: { x: number; y: number; w: number; h: number; value: number; label: string; colors: string[] }[] = [];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.loadData(); }
  ngAfterViewInit() {}

  loadData() {
    this.loading = true;
    forkJoin({
      usuarios:          this.apiService.getAllUsers().pipe(catchError(() => of([]))),
      reservas:          this.apiService.getReserves().pipe(catchError(() => of([]))),
      reservasActivas:   this.apiService.filterReserveActivas().pipe(catchError(() => of([]))),
      reservasExpiradas: this.apiService.filterReserveExpiradas().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ usuarios, reservas, reservasActivas, reservasExpiradas }) => {
        this.usuarios          = usuarios;
        this.totalUsuarios     = usuarios.length;
        this.reservas          = reservas;
        this.totalReservas     = reservas.length;
        this.reservasActivas   = reservasActivas;
        this.totalActivas      = reservasActivas.length;
        this.ingresosMes       = reservasActivas.reduce((acc, r: any) =>
          acc + (r.precio_total || r.precio || r.importe || 0), 0);
        this.reservasExpiradas = reservasExpiradas;
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.renderCharts(), 100);
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  renderCharts() {
    this.renderAreaChart();
    this.renderBarChart();
  }

  // ═══════════════════════════════════════════
  // AREA CHART con tooltip hover
  // ═══════════════════════════════════════════
  renderAreaChart() {
    const canvas = this.areaChartRef?.nativeElement;
    if (!canvas) return;

    // Generar datos
    this.areaLabels = [];
    this.areaData = [];
    for (let i = 30; i >= 0; i -= 3) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      this.areaLabels.push(`${d.getDate()} ${d.toLocaleString('es', { month: 'short' })}`);
      const base = Math.max(1, Math.floor(this.totalReservas / 15));
      this.areaData.push(Math.floor(base + Math.random() * base * 1.5));
    }
    this.areaData[this.areaData.length - 1] = Math.max(this.totalActivas, this.areaData[this.areaData.length - 1]);

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = canvas.offsetWidth  * dpr;
    canvas.height = canvas.offsetHeight * dpr;

    const draw = (hoverIdx: number | null) => {
      const ctx = canvas.getContext('2d')!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const padL = 40, padR = 20, padT = 20, padB = 40;
      const chartW = w - padL - padR;
      const chartH = h - padT - padB;
      const maxVal = Math.max(...this.areaData) * 1.2;

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = padT + (chartH / 5) * i;
        ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + chartW, y); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(String(Math.round(maxVal - (maxVal / 5) * i)), padL - 6, y + 4);
      }

      const pts = this.areaData.map((v, i) => ({
        x: padL + (chartW / (this.areaData.length - 1)) * i,
        y: padT + chartH - (v / maxVal) * chartH
      }));

      // Area gradient
      const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
      grad.addColorStop(0, 'rgba(16,185,129,0.45)');
      grad.addColorStop(1, 'rgba(16,185,129,0.0)');
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const cp = (pts[i - 1].x + pts[i].x) / 2;
        ctx.bezierCurveTo(cp, pts[i - 1].y, cp, pts[i].y, pts[i].x, pts[i].y);
      }
      ctx.lineTo(pts[pts.length - 1].x, padT + chartH);
      ctx.lineTo(pts[0].x, padT + chartH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Line
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const cp = (pts[i - 1].x + pts[i].x) / 2;
        ctx.bezierCurveTo(cp, pts[i - 1].y, cp, pts[i].y, pts[i].x, pts[i].y);
      }
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // X labels
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      this.areaLabels.forEach((l, i) => {
        if (i % 2 === 0) ctx.fillText(l, pts[i].x, h - 8);
      });

      // ── HOVER ──
      if (hoverIdx !== null) {
        const p = pts[hoverIdx];

        // Línea vertical punteada
        ctx.beginPath();
        ctx.moveTo(p.x, padT);
        ctx.lineTo(p.x, padT + chartH);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Punto verde con centro blanco
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        // Tooltip
        const txt = `${this.areaLabels[hoverIdx]}  •  ${this.areaData[hoverIdx]} reservas`;
        ctx.font = '11px sans-serif';
        const tw = ctx.measureText(txt).width;
        const tp = 10, th2 = 28;
        let tx = p.x - tw / 2 - tp;
        const ty = Math.max(4, p.y - th2 - 14);
        if (tx < 4) tx = 4;
        if (tx + tw + tp * 2 > w - 4) tx = w - tw - tp * 2 - 4;

        ctx.fillStyle = 'rgba(13,16,25,0.95)';
        ctx.beginPath();
        (ctx as any).roundRect(tx, ty, tw + tp * 2, th2, 6);
        ctx.fill();
        ctx.strokeStyle = 'rgba(16,185,129,0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#f1f5f9';
        ctx.textAlign = 'left';
        ctx.fillText(txt, tx + tp, ty + th2 / 2 + 4);
      }
    };

    draw(null);

    // Eventos hover
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const padL = 40, padR = 20;
      const chartW = canvas.offsetWidth - padL - padR;

      const xPositions = this.areaData.map((_, i) => padL + (chartW / (this.areaData.length - 1)) * i);
      let closest = -1, minDist = Infinity;
      xPositions.forEach((px, i) => {
        const d = Math.abs(mx - px);
        if (d < minDist) { minDist = d; closest = i; }
      });

      if (minDist < 25) {
        canvas.style.cursor = 'crosshair';
        draw(closest);
      } else {
        canvas.style.cursor = 'default';
        draw(null);
      }
    };

    const onLeave = () => { draw(null); canvas.style.cursor = 'default'; };

    // Limpiar listeners anteriores
    canvas.replaceWith(canvas); // fuerza re-attach
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
  }
exportarPDF() {
  const doc = new jsPDF();
  const fecha = new Date().toLocaleDateString('es-ES');

  // ── Cabecera ──
  doc.setFillColor(15, 17, 23);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ADMIN PANEL', 14, 18);
  doc.setTextColor(180, 180, 180);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Reporte generado: ${fecha}`, 14, 28);
  doc.text(`Dashboard — Resumen general`, 14, 35);

  // ── Métricas ──
  doc.setFillColor(26, 32, 53);
  doc.roundedRect(14, 48, 55, 28, 3, 3, 'F');
  doc.roundedRect(77, 48, 55, 28, 3, 3, 'F');
  doc.roundedRect(140, 48, 55, 28, 3, 3, 'F');

  // Card 1 — Total usuarios
  doc.setTextColor(120, 130, 150);
  doc.setFontSize(7);
  doc.text('TOTAL USUARIOS', 18, 56);
  doc.setTextColor(241, 245, 249);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(String(this.totalUsuarios), 18, 68);

  // Card 2 — Reservas activas
  doc.setTextColor(120, 130, 150);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('RESERVAS ACTIVAS', 81, 56);
  doc.setTextColor(241, 245, 249);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(String(this.totalActivas), 81, 68);

  // Card 3 — Ingresos
  doc.setTextColor(120, 130, 150);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('INGRESOS DEL MES', 144, 56);
  doc.setTextColor(241, 245, 249);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(this.formatCurrency(this.ingresosMes), 144, 68);

  // ── Tabla resumen por categoría ──
  doc.setTextColor(241, 245, 249);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen por categoría', 14, 95);

  // Cabecera tabla
  doc.setFillColor(16, 185, 129);
  doc.rect(14, 100, 182, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Categoría', 18, 106);
  doc.text('Cantidad', 100, 106);
  doc.text('% del total', 150, 106);

  const total = this.totalActivas + this.reservasExpiradas.length + this.totalUsuarios + this.totalReservas;
  const filas = [
    { label: 'Reservas activas',   valor: this.totalActivas,               color: [16, 185, 129] },
    { label: 'Reservas expiradas', valor: this.reservasExpiradas.length,   color: [245, 158, 11] },
    { label: 'Total usuarios',     valor: this.totalUsuarios,              color: [99, 102, 241] },
    { label: 'Total reservas',     valor: this.totalReservas,              color: [6, 182, 212]  },
  ];

  filas.forEach((fila, i) => {
    const y = 108 + i * 10;
    // Fondo alternado
    doc.setFillColor(i % 2 === 0 ? 22 : 26, i % 2 === 0 ? 27 : 32, i % 2 === 0 ? 43 : 53);
    doc.rect(14, y, 182, 10, 'F');

    // Dot de color
    doc.setFillColor(fila.color[0], fila.color[1], fila.color[2]);
    doc.circle(19, y + 5, 2, 'F');

    doc.setTextColor(200, 210, 225);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(fila.label, 24, y + 6.5);
    doc.text(String(fila.valor), 100, y + 6.5);
    doc.text(total > 0 ? `${((fila.valor / total) * 100).toFixed(1)}%` : '0%', 150, y + 6.5);
  });

  // ── Tabla de usuarios ──
  if (this.usuarios.length > 0) {
    doc.setTextColor(241, 245, 249);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Listado de usuarios', 14, 165);

    doc.setFillColor(16, 185, 129);
    doc.rect(14, 170, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('Nombre', 18, 176);
    doc.text('Email', 75, 176);
    doc.text('Rol', 155, 176);

    const maxUsers = Math.min(this.usuarios.length, 15); // máx 15 usuarios
    this.usuarios.slice(0, maxUsers).forEach((u, i) => {
      const y = 178 + i * 9;
      doc.setFillColor(i % 2 === 0 ? 22 : 26, i % 2 === 0 ? 27 : 32, i % 2 === 0 ? 43 : 53);
      doc.rect(14, y, 182, 9, 'F');
      doc.setTextColor(200, 210, 225);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`${u.nombre || ''} ${u.apellidos || ''}`.trim().substring(0, 25), 18, y + 6);
      doc.text((u.email || '').substring(0, 30), 75, y + 6);
      doc.text(u.rol || 'usuario', 155, y + 6);
    });

    if (this.usuarios.length > 15) {
      doc.setTextColor(120, 130, 150);
      doc.setFontSize(8);
      doc.text(`... y ${this.usuarios.length - 15} usuarios más`, 14, 178 + 15 * 9 + 6);
    }
  }

  // ── Footer ──
  const pageH = doc.internal.pageSize.height;
  doc.setFillColor(15, 17, 23);
  doc.rect(0, pageH - 14, 210, 14, 'F');
  doc.setTextColor(80, 90, 110);
  doc.setFontSize(8);
  doc.text(`Admin Panel • ${fecha} • Documento generado automáticamente`, 14, pageH - 5);

  doc.save(`dashboard-reporte-${fecha.replace(/\//g, '-')}.pdf`);
}
  // ═══════════════════════════════════════════
  // BAR CHART con tooltip hover
  // ═══════════════════════════════════════════
  renderBarChart() {
    const canvas = this.barChartRef?.nativeElement;
    if (!canvas) return;

    const categories = ['Activas', 'Expiradas', 'Usuarios', 'Total Reservas'];
    const values = [this.totalActivas, this.reservasExpiradas.length, this.totalUsuarios, this.totalReservas];
    const colors = [
      ['#10b981', '#059669'],
      ['#f59e0b', '#d97706'],
      ['#6366f1', '#4f46e5'],
      ['#06b6d4', '#0891b2']
    ];

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = canvas.offsetWidth  * dpr;
    canvas.height = canvas.offsetHeight * dpr;

    const padL = 35, padR = 15, padT = 15, padB = 35;

    const draw = (hoverIdx: number | null) => {
      const ctx = canvas.getContext('2d')!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const chartW = w - padL - padR;
      const chartH = h - padT - padB;
      const maxVal = Math.max(...values, 1) * 1.25;
      const barW   = (chartW / categories.length) * 0.5;
      const spacing = chartW / categories.length;

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padT + (chartH / 4) * i;
        ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + chartW, y); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
        ctx.fillText(String(Math.round(maxVal - (maxVal / 4) * i)), padL - 4, y + 4);
      }

      // Guardar barras para hit-test
      this.barChartBars = categories.map((cat, i) => {
        const x  = padL + spacing * i + spacing / 2 - barW / 2;
        const bH = (values[i] / maxVal) * chartH;
        const y  = padT + chartH - bH;
        return { x, y, w: barW, h: bH, value: values[i], label: cat, colors: colors[i] };
      });

      this.barChartBars.forEach((bar, i) => {
        const isHover = hoverIdx === i;
        const grad = ctx.createLinearGradient(0, bar.y, 0, bar.y + bar.h);
        grad.addColorStop(0, isHover ? lighten(bar.colors[0], 35) : bar.colors[0]);
        grad.addColorStop(1, isHover ? lighten(bar.colors[1], 20) : bar.colors[1]);
        ctx.fillStyle = grad;

        ctx.beginPath();
        const r = 4;
        ctx.moveTo(bar.x + r, bar.y);
        ctx.lineTo(bar.x + bar.w - r, bar.y);
        ctx.quadraticCurveTo(bar.x + bar.w, bar.y, bar.x + bar.w, bar.y + r);
        ctx.lineTo(bar.x + bar.w, bar.y + bar.h);
        ctx.lineTo(bar.x, bar.y + bar.h);
        ctx.lineTo(bar.x, bar.y + r);
        ctx.quadraticCurveTo(bar.x, bar.y, bar.x + r, bar.y);
        ctx.closePath();
        ctx.fill();

        // Label X
        ctx.fillStyle = isHover ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)';
        ctx.font = isHover ? 'bold 10px sans-serif' : '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(bar.label, bar.x + bar.w / 2, h - 8);

        // Tooltip encima de la barra
        if (isHover) {
          const txt = `${bar.label}: ${bar.value}`;
          ctx.font = 'bold 11px sans-serif';
          const tw = ctx.measureText(txt).width;
          const tp = 9, th2 = 26;
          const tx = bar.x + bar.w / 2 - tw / 2 - tp;
          const ty = Math.max(2, bar.y - th2 - 8);

          ctx.fillStyle = 'rgba(13,16,25,0.95)';
          ctx.beginPath();
          (ctx as any).roundRect(tx, ty, tw + tp * 2, th2, 5);
          ctx.fill();
          ctx.strokeStyle = bar.colors[0] + '99';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#f1f5f9';
          ctx.textAlign = 'left';
          ctx.fillText(txt, tx + tp, ty + th2 / 2 + 4);
        }
      });
    };

    draw(null);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      let found = -1;
      this.barChartBars.forEach((bar, i) => {
        if (mx >= bar.x - 6 && mx <= bar.x + bar.w + 6 && my >= bar.y && my <= bar.y + bar.h) {
          found = i;
        }
      });

      canvas.style.cursor = found >= 0 ? 'pointer' : 'default';
      draw(found >= 0 ? found : null);
    };

    const onLeave = () => { draw(null); canvas.style.cursor = 'default'; };

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
  }

  logout() { this.authService.logout(); this.router.navigate(['/home']); }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
  }

  openUser() { this.router.navigate(['/admin/users']); }

  getInitials(nombre?: string, apellidos?: string): string {
    return ((nombre?.[0] || '') + (apellidos?.[0] || '')).toUpperCase() || '?';
  }
}

function lighten(hex: string, amount: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (n >> 16) + amount);
  const g = Math.min(255, ((n >> 8) & 0xff) + amount);
  const b = Math.min(255, (n & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}
