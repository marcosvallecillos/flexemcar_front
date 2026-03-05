import { Component, HostListener } from '@angular/core';
import { ModalLoginComponent } from '../modal-login/modal-login.component';
import { LanguageService } from '../../services/language.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api-service.service';
import { ShowFavorites } from '../../views/show-favorites/show-favorites';

@Component({
  selector: 'app-header',
  imports: [ModalLoginComponent,RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  mostrarHeader: boolean = true
  showCarritoModal: boolean = false;
  isSpanish: boolean = true;
  isMenuOpen: boolean = false;
  showLoginModal: boolean = false;
  isScrolled: boolean = false;

  private scrollThreshold: number | null = null;

  cartItemsCount:number = 0;

  
  constructor(private languageService: LanguageService, 
    private route: ActivatedRoute,
    private router: Router,
    private apiService:ApiService) {
    this.languageService.isSpanish$.subscribe(
      isSpanish => this.isSpanish = isSpanish
    );
  }
  ngOnInit() {

    this.router.events.subscribe(() => {
      this.mostrarHeader = this.router.url !== '/index'; 
    });

    // Calcula el alto del hero cuando la vista está lista
    setTimeout(() => {
      this.updateScrollThreshold();
      this.onWindowScroll();
    }, 0);
  }


  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (typeof window === 'undefined') {
      return;
    }

    if (this.scrollThreshold === null) {
      this.updateScrollThreshold();
    }

    const currentScroll = window.scrollY || document.documentElement.scrollTop || 0;
    const threshold = this.scrollThreshold ?? 120;
    this.isScrolled = currentScroll > threshold;
  }

  private updateScrollThreshold() {
    if (typeof window === 'undefined') {
      this.scrollThreshold = 120;
      return;
    }

    const heroElement = document.querySelector('.carousel') as HTMLElement | null;

    if (heroElement) {
      const rect = heroElement.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const heroBottom = rect.top + scrollTop + rect.height;

      // Restamos un poco para que el cambio pase justo al terminar el hero
      this.scrollThreshold = heroBottom - 80;
    } else {
      // Umbral por defecto si no hay hero en la pantalla actual
      this.scrollThreshold = 120;
    }
  }

  closeMenu() {
    this.isMenuOpen = false;
    document.body.style.overflow = '';
  }

  toggleLanguage(language: 'es' | 'en') {
    this.languageService.setLanguage(language);
    localStorage.setItem('language', language);
  }

  getText(es: string, en: string): string {
    return this.isSpanish ? es : en;
  }
  showRegisterModal: boolean = false;

  openLoginModal() {
    this.showLoginModal = true;
  }

  closeLoginModal() {
    this.showLoginModal = false;
  }

  openRegisterModal() {
    this.showRegisterModal = true;
  }

  closeRegisterModal() {
    this.showRegisterModal = false;
  }
  openFavorites() {
    this.router.navigate(['/favorites']);
  }


}
