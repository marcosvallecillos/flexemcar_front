import { Component, OnInit } from '@angular/core';
import { Reserva, Usuario } from '../../models/user.interface';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ModalLoginComponent } from '../../components/modal-login/modal-login.component';
import { LanguageService } from '../../services/language.service';
import { UserStateService } from '../../services/user-state.service';
import { NgClass } from '@angular/common';
import { Footer } from '../../components/footer/footer';
import { ApiService } from '../../services/api-service.service';

@Component({
  selector: 'app-show-profile',
  imports: [FormsModule, Footer, ModalLoginComponent,NgClass],
  templateUrl: './show-profile.component.html',
  styleUrl: './show-profile.component.css'
})
export class ShowProfileComponent implements OnInit {
  usuario: Usuario | null = null;
  isSpanish: boolean = true;
  showLoginModal: boolean = false;
  isLoading:boolean = true;
 protected readonly Math = Math; 
   reservasPorUsuario: { [usuarioId: number]: number } = {};

  constructor(
    private languageService: LanguageService,
    private apiService:ApiService,
    private router: Router,
    private userStateService: UserStateService
  ) {
    this.languageService.isSpanish$.subscribe(
      isSpanish => this.isSpanish = isSpanish
    );
  }

  ngOnInit() {
    this.checkUserSession();
    this.calcularReservasPorUsuario();

  }
  showPassword: boolean = false;

  togglePasswordVisibility(field: 'password') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    }
  }
 checkUserSession() {
  const userDataStr = localStorage.getItem('userData');
  console.log('RAW localStorage:', userDataStr); // ← log 1
  
  if (userDataStr) {
    try {
      this.usuario = JSON.parse(userDataStr);
      console.log('Usuario parseado:', this.usuario); // ← log 2
      console.log('ID del usuario:', (this.usuario as any)?.id); // ← log 3

      // Prueba con casting any para evitar errores de tipado
      const id = (this.usuario as any)?.id 
              ?? (this.usuario as any)?.usuario_id
              ?? (this.usuario as any)?.userId;

      console.log('ID encontrado:', id); // ← log 4

      if (id) {
        this.cargarReservasUsuario(id);
      } else {
        console.warn('No se encontró ID en el objeto usuario');
      }

    } catch (e) {
      console.error('Error parsing:', e);
      this.usuario = null;
      this.router.navigate(['/home-barber']);
    }
  } else {
    this.usuario = null;
    this.router.navigate(['/home-barber']);
  }
}

  toggleLanguage(language: 'es' | 'en') {
    this.languageService.setLanguage(language);
    localStorage.setItem('language', language);
  }

  getText(es: string, en: string): string {
    return this.isSpanish ? es : en;
  }

  openLoginModal() {
    this.showLoginModal = true;
  }
  
  closeLoginModal() {
    this.showLoginModal = false;
    
    this.router.navigate(['home']);
    window.location.reload()
  }

  editarPerfil() {
    console.log("abriendo editProfile")
    this.router.navigate(['/editProfile']);
  }

  cerrarSesion() {
    localStorage.removeItem('userData');
    this.usuario = null;
    this.router.navigate(['home']);
    window.location.reload()
  }
  reserves: Reserva[] = [];
  usuariosPorId: { [usuarioId: number]: Usuario } = {};

   private enlazarUsuariosAReservas() {
    if (!this.reserves?.length || !this.usuariosPorId) {
      return;
    }
    this.reserves = this.reserves.map((reserve) => ({
      ...reserve,
      usuario: reserve.usuario_id != null ? this.usuariosPorId[reserve.usuario_id] : reserve.usuario,
    }));
  }

  reservasUsuario: number = 0;


  cargarReservasUsuario(usuarioId: number) {
  this.apiService.getNumeroReservasByUsuarioId(usuarioId).subscribe({
    next: (respuesta) => {
      this.isLoading= false;
      console.log('Respuesta reservas:', respuesta); // ← verifica la respuesta
      this.reservasUsuario = respuesta.totalReservas || 0;
    },
    error: (err) => {
      console.error('Error:', err); // ← verifica si hay error CORS o 404
      this.reservasUsuario = 0;
    }
  });
}
  private calcularReservasPorUsuario() {
    const usuarioIdsUnicos = new Set<number>();
    this.reserves.forEach((reserve) => {
      if (reserve.usuario_id != null) {
        usuarioIdsUnicos.add(reserve.usuario_id);
      }
    });

    if (usuarioIdsUnicos.size === 0) {
      this.reservasPorUsuario = {};
      return;
    }

    const conteo: { [usuarioId: number]: number } = {};
    const usuarioIdsArray = Array.from(usuarioIdsUnicos);
    let llamadasCompletadas = 0;
    const totalLlamadas = usuarioIdsArray.length;
    usuarioIdsArray.forEach((usuarioId) => {
      this.apiService.getNumeroReservasByUsuarioId(usuarioId).subscribe({
        next: (respuesta) => {
          console.log("Conteo resrva",respuesta)

          conteo[usuarioId] = respuesta.totalReservas || 0;
          llamadasCompletadas++;
          
          if (llamadasCompletadas === totalLlamadas) {
            this.reservasPorUsuario = conteo;
          }
        },
        error: (error) => {
          console.error(`Error al obtener reservas para usuario ${usuarioId}:`, error);
          conteo[usuarioId] = 0;
          llamadasCompletadas++;
          
          if (llamadasCompletadas === totalLlamadas) {
            this.reservasPorUsuario = conteo;
          }
        }
      });
    });
  }
}
