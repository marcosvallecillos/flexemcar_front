import { Component, HostListener, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Reviews } from '../../components/reviews/reviews';
import { Reserva } from '../../models/user.interface';
import { LanguageService } from '../../services/language.service';
import { ActivatedRoute, Router, RouterLink, NavigationEnd } from '@angular/router';
import { ApiService } from '../../services/api-service.service';
import { AuthService } from '../../services/auth.service';
import { Footer } from "../../components/footer/footer";
import { ModalLoginComponent } from "../../components/modal-login/modal-login.component";
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-show-catalogo',
  imports: [Footer, ModalLoginComponent, RouterLink, NgClass, FormsModule],
  templateUrl: './show-catalogo.html',
  styleUrl: './show-catalogo.css',
})
export class ShowCatalogo implements OnInit, OnDestroy {

reserves: Reserva[] = [];
reservasOriginales: Reserva[] = []; 
isUser = false;
isAuthenticated = true;
isSpanish: boolean = true;
showLoginModal: boolean = false;
showModal: boolean = false;
selectedReserve: Reserva | null = null;
isLoading: boolean = true;
showDropdown = false;
currentFilter: 'all' | 'activas' | 'expiradas' = 'all';
filterError: string | null = null;
codigoReserva: string = '';
showModalCode: boolean = false;
valoracion: Reviews[] = [];
showDetailsModal: boolean = false;
editedTime: string = '';
editedDay: string = '';

private authSubscription?: Subscription;
private languageSubscription?: Subscription;
private routerSubscription?: Subscription;

constructor(
  private authService: AuthService,
  private router: Router,
  private languageService: LanguageService,
  private apiService: ApiService,
  private cdr: ChangeDetectorRef,
) {
  this.languageSubscription = this.languageService.isSpanish$.subscribe(isSpanish => {
    this.isSpanish = isSpanish;
    this.cdr.detectChanges();
  });
}

ngOnInit() {
  this.checkUserAndLoadReserves();
  
  // Suscribirse a cambios de autenticación
  this.authSubscription = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
    this.checkUserAndLoadReserves();
  });

  // Suscribirse a eventos de navegación para recargar cuando se vuelve a esta página
  this.routerSubscription = this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      // Pequeño delay para asegurar que el componente está listo
      setTimeout(() => {
        this.checkUserAndLoadReserves();
      }, 50);
    });
}

ngOnDestroy() {
  if (this.authSubscription) {
    this.authSubscription.unsubscribe();
  }
  if (this.languageSubscription) {
    this.languageSubscription.unsubscribe();
  }
  if (this.routerSubscription) {
    this.routerSubscription.unsubscribe();
  }
}

private checkUserAndLoadReserves() {
  const userId = this.authService.getUserId();
  const userData = this.authService.getUserData();

  if (userId && userData) {
    this.isUser = true;
    this.loadUserReserves();
  } else {
    this.isUser = false;
    this.isLoading = false;
    this.reserves = [];
    this.reservasOriginales = [];
  }
  this.cdr.detectChanges();
}

loadUserReserves() {
  if (this.isLoading && this.reserves.length > 0) return; // guard

  this.isLoading = true;
  const userId = this.authService.getUserId();
  if (!userId) { 
    this.isLoading = false; 
    this.cdr.detectChanges();
    return; 
  }

  this.apiService.getReserveByUsuario(userId).subscribe({
    next: (response) => {
      const mapped = this.mapReservaResponse(response);
      this.reservasOriginales = this.sortReserves(mapped);
      this.reserves = [...this.reservasOriginales];
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error(err);
      this.isLoading = false;
      this.cdr.detectChanges();
    },
    complete: () => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  });
}

// ✅ Filtrado LOCAL — cero llamadas al backend
filtrar(tipo: 'all' | 'activas' | 'expiradas') {
  this.filterError = null;
  this.currentFilter = tipo;
  this.showDropdown = false;

  if (tipo === 'all') {
    this.reserves = this.reservasOriginales;
    return;
  }

  const ahora = new Date();

  this.reserves = this.reservasOriginales.filter(reserve => {
    const [year, month, day] = reserve.dia.split('-').map(Number);
    const [hours, minutes] = reserve.hora.split(':').map(Number);
    const fechaReserva = new Date(year, month - 1, day, hours, minutes);
    const isPast = fechaReserva < ahora;

    return tipo === 'activas' ? !isPast : isPast;
  });
}

// --- El resto sin cambios ---

private sortReserves(reservas: Reserva[]): Reserva[] {
  return reservas.sort((a, b) => {
    const ordenDia = a.dia.localeCompare(b.dia);
    return ordenDia !== 0 ? ordenDia : a.hora.localeCompare(b.hora);
  });
}

private mapReservaResponse(response: any[]): Reserva[] {
  return response.map((r: any) => ({
    ...r,
    // Normalizamos ids
    usuario_id: r.usuario_id,
    vehiculo_id: r.vehiculo?.id ?? r.vehiculo_id,
    vehiculo_model: r.vehiculo_model ?? r.vehiculo?.model ?? '',

    // Normalizamos la info de valoración al shape de la interfaz
    valoracion_id: r.valoracion ?? r.valoracion_id ?? null,
    valoracion_comentario: r.valoracion_comentario ?? null,
    valoracion_servicio: r.valoracion_servicio ?? null,
    valoracion_fecha: r.valoracion_fecha ?? null,

    // Adaptamos el objeto vehiculo del backend al Catalogo del front
    vehiculo: r.vehiculo
      ? {
          id: r.vehiculo.id,
          marca: r.vehiculo.marca,
          modelo: r.vehiculo.model,            // backend: model
          year: r.vehiculo.year ?? 0,
          motor: r.vehiculo.motor ?? '',
          km: r.vehiculo.kms ?? r.vehiculo.km ?? 0, // backend: kms
          image_url: Array.isArray(r.vehiculo.image_url)
            ? r.vehiculo.image_url
            : (r.vehiculo.image?.url ? [r.vehiculo.image.url] : []),
          precio: r.vehiculo.precio ?? '',
          reservas: r.vehiculo.reservas ?? [],
        }
      : undefined,
  }) as Reserva);
}

isReservePast(reserve: Reserva): boolean {
  const [year, month, day] = reserve.dia.split('-').map(Number);
  const [hours, minutes] = reserve.hora.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes) < new Date();
}

deleteReserve(reserve: Reserva) {
  this.selectedReserve = reserve;
  this.showModal = true;
}

onConfirmDelete() {
  if (this.selectedReserve) {
    this.deleteReservation(this.selectedReserve.id);
  }
}

private deleteReservation(reserveId: number) {
  this.apiService.deleteReserve(reserveId).subscribe({
    next: () => {
      // ✅ Eliminar también del caché original
      this.reservasOriginales = this.reservasOriginales.filter(r => r.id !== reserveId);
      this.reserves = this.reserves.filter(r => r.id !== reserveId);
      this.selectedReserve = null;
      this.showModal = false;
      this.showDetailsModal = false;
    },
    error: (error) => console.error('Error al eliminar la reserva:', error)
  });
}

openDetails(reserve: Reserva) {
  this.selectedReserve = reserve;
  this.editedDay = reserve.dia;
  this.editedTime = reserve.hora;
  this.showDetailsModal = true;
}

closeDetailsModal() {
  this.showDetailsModal = false;
  this.selectedReserve = null;
}

saveEditedTime() {
  if (!this.selectedReserve || !this.editedTime || !this.editedDay ) {
    this.closeDetailsModal();
    return;
  }

  const reserveId = this.selectedReserve.id;
  const updatedReserve: Reserva = { ...this.selectedReserve, dia:this.editedDay ,hora: this.editedTime };

  this.apiService.editReserve(reserveId, updatedReserve).subscribe({
    next: () => {
      // Recargamos las reservas para mantener la lógica de mapeo y orden
      this.loadUserReserves();
      this.showDetailsModal = false;
      this.selectedReserve = null;
    },
    error: (err) => {
      console.error('Error al actualizar la reserva:', err);
    }
  });
}

cancelReserveFromModal() {
  if (!this.selectedReserve) { return; }
  this.deleteReservation(this.selectedReserve.id);
}

getText(es: string, en: string): string { return this.isSpanish ? es : en; }
openLoginModal() { this.showLoginModal = true; }
onModalClose() { 
  this.showLoginModal = false;
  // Verificar si el usuario ahora está autenticado y recargar reservas
  setTimeout(() => {
    this.checkUserAndLoadReserves();
  }, 100);
}
onCancelReserve() { this.showModal = false; this.selectedReserve = null; }
closeModalCode() { this.showModalCode = false; this.codigoReserva = ''; }
getStars(rating: number | null | undefined): string {
  if (rating == null) return '☆☆☆☆☆';
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}
toggleDropdown() { this.showDropdown = !this.showDropdown; }

@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  if (!(event.target as HTMLElement).closest('.dropdown')) {
    this.showDropdown = false;
  }
}
 
}
