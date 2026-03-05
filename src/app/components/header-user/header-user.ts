import { Component, HostListener } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api-service.service';
import { Catalogo } from '../../models/user.interface';

@Component({
  selector: 'app-header-user',
  imports: [RouterLink],
  templateUrl: './header-user.html',
  styleUrl: './header-user.css',
})
export class HeaderUser {
   isSpanish: boolean = true;
    productos: Catalogo[] = [];
    isMenuOpen: boolean = false;
    mostrarHeader: boolean = false;
    showCarritoModal: boolean = false;
    isAuthenticated: boolean = true;
    cartItemsCount: number = 0;
  isScrolled: boolean = false;

    constructor(
      private languageService: LanguageService,
      private route: ActivatedRoute,
      private router: Router,
      private apiService: ApiService
    ) {
      this.languageService.isSpanish$.subscribe(
        (isSpanish) => (this.isSpanish = isSpanish)
      );

      const userData = localStorage.getItem('userData');
      this.isAuthenticated = !!userData;
    }
    isFalling = false;

    onLogoutClick(): void {
      this.isFalling = true;
    
      setTimeout(() => {
        this.isFalling = false;
        this.signout(); // tu método real
      }, 700); // dura lo mismo que la animación
    }
    
    ngOnInit() {
      this.router.events.subscribe(() => {
        this.mostrarHeader = this.router.url !== '/index';
      });

      // Suscribirse al observable de cartItemsCount
      this.apiService.cartItemsCount$.subscribe((count) => {
        this.cartItemsCount = count !== null && count !== undefined ? count : 0;
      });

      // Opcional: inicializar con el valor actual
      this.cartItemsCount = this.apiService.cartItemsCount.value || 0;
    }

    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
      document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    }

    toggleLanguage(language: 'es' | 'en') {
      this.languageService.setLanguage(language);
      localStorage.setItem('language', language);
    }

    getText(es: string, en: string): string {
      return this.isSpanish ? es : en;
    }

    isUser: boolean = true;

    signout() {
      localStorage.removeItem('userType');
      localStorage.removeItem('userData');
      this.isUser = false;
      this.isAuthenticated = false;
      this.router.navigate(['/home-barber']);
      window.location.reload()
      
    }

    
  openFavorites() {
    this.router.navigate(['/favorites']);
  }
}
