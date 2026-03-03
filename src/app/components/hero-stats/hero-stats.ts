import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Metric {
  icon: string;
  value: number;
  suffix: string;
  label: string;
  trend: string;
  decimals?: number;
}

@Component({
  selector: 'app-hero-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-stats.html',
  styleUrl: './hero-stats.css',
})
export class HeroStats implements OnInit, AfterViewInit {
  @ViewChild('metricsSection', { static: false }) metricsSection!: ElementRef;

  metrics: Metric[] = [
    {
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/>
      </svg>`,
      value: 1247,
      suffix: '+',
      label: 'Furgonetas vendidas',
      trend: '↑ +18% este año',
      decimals: 0
    },
    {
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
      </svg>`,
      value: 98,
      suffix: '%',
      label: 'Clientes satisfechos',
      trend: '↑ Consistente en 3 años',
      decimals: 0
    },
    {
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
      </svg>`,
      value: 100,
      suffix: '%',
      label: 'Vehículos certificados',
      trend: '✓ Garantía incluida',
      decimals: 0
    },
    {
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
      </svg>`,
      value: 4.2,
      suffix: '/5',
      label: 'Valoración media',
      trend: '★★★★★ en Google',
      decimals: 1
    }
  ];

  displayValues = signal<number[]>([0, 0, 0, 0]);
  hasAnimated = false;
  private rafIds: number[] = [];
  private readonly DURATION = 1800; // 1.8 segundos
  private readonly STAGGER = 120; // 120ms entre cada contador

  ngOnInit() {
    // Inicializar valores en 0
    this.displayValues.set([0, 0, 0, 0]);
  }

  ngAfterViewInit() {
    // Esperar un poco para que el DOM esté completamente renderizado
    setTimeout(() => {
      this.setupIntersectionObserver();
    }, 100);
  }

  private setupIntersectionObserver() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window && this.metricsSection) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !this.hasAnimated) {
              this.hasAnimated = true;
              this.animateAllCounters();
              observer.disconnect();
            }
          });
        },
        {
          threshold: 0.3,
          rootMargin: '0px'
        }
      );

      observer.observe(this.metricsSection.nativeElement);
    } else {
      // Fallback: iniciar animación después de un delay
      setTimeout(() => this.animateAllCounters(), 500);
    }
  }

  private easeOutExpo(t: number): number {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  private animateCounter(index: number, target: number, decimals: number) {
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / this.DURATION, 1);
      const eased = this.easeOutExpo(progress);
      const current = target * eased;

      const currentValues = [...this.displayValues()];
      
      if (decimals > 0) {
        currentValues[index] = parseFloat(current.toFixed(decimals));
      } else {
        currentValues[index] = Math.floor(current);
      }
      
      this.displayValues.set(currentValues);

      if (progress < 1) {
        this.rafIds[index] = requestAnimationFrame(tick);
      } else {
        // Asegurar valor final exacto
        const finalValues = [...this.displayValues()];
        finalValues[index] = target;
        this.displayValues.set(finalValues);
      }
    };

    this.rafIds[index] = requestAnimationFrame(tick);
  }

  private animateAllCounters() {
    // Cancelar cualquier animación previa
    this.rafIds.forEach(id => cancelAnimationFrame(id));
    this.rafIds = [];
    
    // Resetear valores
    this.displayValues.set([0, 0, 0, 0]);

    // Animar cada contador con stagger
    this.metrics.forEach((metric, index) => {
      setTimeout(() => {
        this.animateCounter(index, metric.value, metric.decimals || 0);
      }, index * this.STAGGER);
    });
  }

  formatValue(value: number, decimals?: number): string {
    if (decimals !== undefined && decimals > 0) {
      return value.toFixed(decimals);
    }
    
    // Formatear números grandes con comas
    if (value >= 1000) {
      return Math.floor(value).toLocaleString('es-ES');
    }
    
    return Math.floor(value).toString();
  }
}
