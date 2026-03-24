import { Component } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { ApiService } from '../../services/api-service.service';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserStateService } from '../../services/user-state.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-aside-admin',
  imports: [RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './aside-admin.html',
  styleUrl: './aside-admin.css',
})
export class AsideAdmin {

  isSpanish: boolean = false;
  sidebarOpen: boolean = false;   // controla colapso (false = colapsado)

  constructor(
    private languageService: LanguageService,
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private userStateService: UserStateService
  ) {
    this.languageService.isSpanish$.subscribe(
      isSpanish => this.isSpanish = isSpanish
    );
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  getText(es: string, en: string): string {
    return this.isSpanish ? es : en;
  }
}