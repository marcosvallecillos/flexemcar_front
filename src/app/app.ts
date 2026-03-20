import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Usuario } from './models/user.interface';
import { Header } from "./components/header/header";
import { HeaderUser } from './components/header-user/header-user';
import { DashboardAdmin } from "./components/dashboard-admin/dashboard-admin";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, HeaderUser, DashboardAdmin], // ← elimina DashboardAdmin aquí
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('myapp');
  isUser: boolean = false;
  mostrarHeader: boolean = false;
  mostrarHome:boolean = false;
  usuario: Usuario | null = null;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.actualizarEstadoUsuario();
        const url = this.router.url;
        this.mostrarHeader = !url.startsWith('/admin')
          && !url.startsWith('/policy-cookies')
          && !url.startsWith('/privacy-policy');

        if (url !== '/home') {
          window.scrollTo(0, 0);
        }
      });
  }

  ngOnInit() {
    this.actualizarEstadoUsuario();

    window.addEventListener('storage', () => {
      this.actualizarEstadoUsuario();
    });
  }

  private actualizarEstadoUsuario() {
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('userData');

    this.isUser = userType === 'usuario';

    if (userData) {
      try {
        this.usuario = JSON.parse(userData);
      } catch {
        this.usuario = null;
      }
    } else {
      this.usuario = null;
    }
  }
}