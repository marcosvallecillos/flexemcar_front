import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

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
get metrics(): Metric[] {
  return [
    {
      icon: `&#128200;`,
      value: 1247,
      suffix: '+',
      label: this.getText('Furgonetas vendidas','Vans sold'),
      trend: this.getText('↑ +18% este año','↑ +18% this year'),
      decimals: 0
    },
    {
      icon: `👥`,
      value: 98,
      suffix: '%',
      label: this.getText('Clientes satisfechos','Satisfied customers'),
      trend: this.getText('↑ Consistente en 3 años','↑ Consistent for 3 years'),
      decimals: 0
    },
    {
      icon: `<i class="icono fas fa-shield-alt"></i>`,
      value: 100,
      suffix: '%',
      label: this.getText('Vehículos certificados','Certified vehicles'),
      trend: this.getText('✓ Garantía incluida','✓ Warranty included'),
      decimals: 0
    },
    {
      icon: `<i class="icono fas fa-star"></i>`,
      value: 4.2,
      suffix: '/5',
      label: this.getText('Valoración media','Average rating'),
      trend: this.getText('★★★★★ en Google','★★★★★ on Google'),
      decimals: 1
    }
  ];
}

  displayValues = signal<number[]>([0, 0, 0, 0]);
  hasAnimated = false;
  private rafIds: number[] = [];
  isSpanish:boolean = true;
  private readonly DURATION = 1800; // 1.8 segundos
  private readonly STAGGER = 120; // 120ms entre cada contador
 constructor(private languageService: LanguageService) {
      this.languageService.isSpanish$.subscribe(
        isSpanish => this.isSpanish = isSpanish
      );
    }
  
    getText(es: string, en: string): string {
      return this.isSpanish ? es : en;
    }
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
