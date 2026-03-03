import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Usuario } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private isUserSubject = new BehaviorSubject<boolean>(false);
  isUser$ = this.isUserSubject.asObservable();

  private userSubject = new BehaviorSubject<Usuario | null>(null);
  user$ = this.userSubject.asObservable();

  constructor() {
    this.checkUserState();
    window.addEventListener('storage', () => {
      this.checkUserState();
    });
  }

  private checkUserState() {
    const userType = localStorage.getItem('userType');
    this.isUserSubject.next(userType === 'usuario');

    const userDataStr = localStorage.getItem('userData');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        this.userSubject.next(userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
        this.userSubject.next(null);
      }
    } else {
      this.userSubject.next(null);
    }
  }

  getIsUser(): boolean {
    const userType = localStorage.getItem('userType');
    return userType === 'usuario';
  }

  getIsAdmin(): boolean {
    const userType = localStorage.getItem('userType');
    return userType === 'admin';
  }

  updateUser(userData: Usuario) {
    this.userSubject.next(userData);
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userType', 'usuario');
    window.dispatchEvent(new Event('storage'));
  }

  clearUser() {
    this.userSubject.next(null);
    this.isUserSubject.next(false);
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    window.dispatchEvent(new Event('storage'));
  }
} 