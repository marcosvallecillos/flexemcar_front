import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Hero } from "../../components/hero/hero";
import { HeroStats } from "../../components/hero-stats/hero-stats";
import { Footer } from "../../components/footer/footer";
import { AboutSection } from "../../components/about-section/about-section";
import { Vehicles } from "../../components/vehicles/vehicles";
import { Reviews } from "../../components/reviews/reviews";
import { CtaBanner } from "../../components/cta-banner/cta-banner";
import { ChatbotComponent } from '../../components/Chatbot/chatbot.component';
import { NavigationEnd, Router } from '@angular/router';
import { ApiService } from '../../services/api-service.service';
import { fromReadableStreamLike } from 'rxjs/internal/observable/innerFrom';
import { Usuario } from '../../models/user.interface';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { SearchVehicle } from '../../components/search-vehicle/search-vehicle';

@Component({
  selector: 'app-home',
  imports: [Hero, HeroStats, Footer, AboutSection, Vehicles, Reviews, CtaBanner, ChatbotComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, AfterViewInit {
  mostrarhome: boolean = false;
   
  constructor(private router: Router, private apiService: ApiService,    private authService: AuthService  


  ) {
    }
usuario: Usuario | null = null;
esAdmin = false;

ngOnInit() {
  const usuario = this.authService.getUserData();
  this.esAdmin = usuario?.rol === 'admin'; 
   const userData = localStorage.getItem('userData');
  if (userData) {
    try {
      const usuario = JSON.parse(userData);
      if (usuario?.rol === 'admin') {
        this.router.navigate(['/admin/dashboard']);
        return; 
      }
    } catch (e) {}
  }
  if (this.esAdmin) {
    this.router.navigate(['/admin/dashboard']);
    return;
  }

    if (typeof document !== 'undefined') {
      document.body.style.opacity = '0';
      setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in';
        document.body.style.opacity = '1';
      }, 100);
    }
  }

  ngAfterViewInit() {
        if (this.usuario?.rol === 'admin') return; 
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
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      setTimeout(() => {
        const elements = document.querySelectorAll('.fade-in-up');
        elements.forEach(el => observer.observe(el));
      }, 300);
    }
  }
}
