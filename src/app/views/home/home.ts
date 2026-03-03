import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Hero } from "../../components/hero/hero";
import { HeroStats } from "../../components/hero-stats/hero-stats";
import { Footer } from "../../components/footer/footer";
import { AboutSection } from "../../components/about-section/about-section";
import { Vehicles } from "../../components/vehicles/vehicles";
import { Reviews } from "../../components/reviews/reviews";
import { CtaBanner } from "../../components/cta-banner/cta-banner";

@Component({
  selector: 'app-home',
  imports: [Hero, HeroStats, Footer, AboutSection, Vehicles, Reviews, CtaBanner],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, AfterViewInit {
  ngOnInit() {
    // Animación inicial al cargar
    if (typeof document !== 'undefined') {
      document.body.style.opacity = '0';
      setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in';
        document.body.style.opacity = '1';
      }, 100);
    }
  }

  ngAfterViewInit() {
    // Configurar Intersection Observer para animaciones de scroll
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Opcional: dejar de observar después de animar para mejor rendimiento
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      // Observar todos los elementos con clase fade-in-up después de un pequeño delay
      setTimeout(() => {
        const elements = document.querySelectorAll('.fade-in-up');
        elements.forEach(el => observer.observe(el));
      }, 300);
    }
  }
}
