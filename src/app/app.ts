import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Usuario } from './models/user.interface';
import { ApiService } from './services/api-service.service';
import { Header } from "./components/header/header";
import { HeaderUser } from './components/header-user/header-user';
import { HeaderAdmin } from './components/header-admin/header-admin';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header,HeaderUser,HeaderAdmin],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('myapp');
   isUserRegistered: string | null = null;
  isUser: boolean = false; 
  isLoggedIn: boolean = false;
  mostrarHeader: boolean = false;
  usuario: Usuario | null = null;
  isAdmin:boolean = false;
    constructor(private router: Router, private apiService: ApiService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (this.router.url !== '/home') {
          window.scrollTo(0, 0);
        }
        this.mostrarHeader = this.router.url !== '/index' ; 
        


      }
    });
  }

  
  ngOnInit() {
    this.actualizarEstadoUsuario();
    
    window.addEventListener("storage", () => {
      this.actualizarEstadoUsuario();
    });

    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    
    this.router.events.subscribe(() => {
      this.mostrarHeader = this.router.url !== '/index' && this.router.url !== '/policy-cookies' && this.router.url !== '/privacy-policy'; 
    });
    console.log('Mostrando header:', this.mostrarHeader);

  }
  
  private actualizarEstadoUsuario() {
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('userData');
    
    this.isUserRegistered = userType || null;
    this.isUser = userType === 'usuario';
    this.isAdmin = userType === 'admin';
    this.isLoggedIn = !!userData;

    if (userData) {
      try {
        this.usuario = JSON.parse(userData);
        
      } catch (e) {
        this.usuario = null;
      }
    } else {
      this.usuario = null;
    }
  }

  logout() {
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    this.isUserRegistered = null;
    this.isUser = false;
    this.isLoggedIn = false;
    this.usuario = null;
    
    window.dispatchEvent(new Event("storage"));
    window.location.reload();
  }
}
