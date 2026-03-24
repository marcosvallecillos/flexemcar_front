import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthUserGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const isLoggedIn = this.authService.isLoggedIn();
    if (isLoggedIn) {
      return true;
    }

    // Redirigir a la página de inicio si no está autenticado
    this.router.navigate(['/home']);
    return false;
  }
}







