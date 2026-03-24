import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const user = this.authService.getUserData(); // método que devuelve el usuario logueado
    if (user && (user.rol === 'admin' || user.role === 'admin')) {
      return true;
    }

    // Redirigir a la página de inicio si no es admin
    this.router.navigate(['/home']);
    return false;
  }
}
