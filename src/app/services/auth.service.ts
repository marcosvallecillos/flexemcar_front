import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor() {
    this.checkLoginStatus();
  }

  private checkLoginStatus() {
    const userData = localStorage.getItem('userData');
    const isLoggedIn = !!userData;
    this.isLoggedInSubject.next(isLoggedIn);
    if (isLoggedIn) {
      try {
        const user = JSON.parse(userData);
        const userRole = user.rol || user.role;
        if (userRole === 'admin') {
          localStorage.setItem('userType', 'admin');
        } else {
          localStorage.setItem('userType', 'usuario');
        }
      } catch (e) {
        localStorage.setItem('userType', 'usuario');
      }
    } else {
      localStorage.setItem('userType', 'invitado');
    }
  }

  login(userData: any) {
    localStorage.setItem('userData', JSON.stringify(userData));
    // Establecer userType según el rol del usuario
    const userRole = userData.rol || userData.role;
    if (userRole === 'admin') {
      localStorage.setItem('userType', 'admin');
    } else {
      localStorage.setItem('userType', 'usuario');
    }
    this.isLoggedInSubject.next(true);
  }

  logout() {
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    this.isLoggedInSubject.next(false);
  }

  isLoggedIn(): boolean {
    // Verificar tanto el BehaviorSubject como el localStorage para mayor seguridad
    const userData = localStorage.getItem('userData');
    const isLoggedIn = !!userData;
    if (isLoggedIn !== this.isLoggedInSubject.value) {
      this.isLoggedInSubject.next(isLoggedIn);
    }
    return isLoggedIn;
  }

  getUserData(): any {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }
  getUserId(): number | null {
    const userData = this.getUserData();
    return userData ? userData.id : null;
  }
}
