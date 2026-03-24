import { Component, HostListener, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Reviews } from '../../components/reviews/reviews';
import { Catalogo, Reserva } from '../../models/user.interface';
import { LanguageService } from '../../services/language.service';
import { ActivatedRoute, Router, RouterLink, NavigationEnd } from '@angular/router';
import { ApiService } from '../../services/api-service.service';
import { AuthService } from '../../services/auth.service';
import { Footer } from "../../components/footer/footer";
import { ModalLoginComponent } from "../../components/modal-login/modal-login.component";
import { ModalDeleteComponent } from "../../components/modal-delete/modal-delete.component";
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-show-catalogo',
  imports: [Footer, ModalLoginComponent, ModalDeleteComponent, RouterLink, NgClass, FormsModule],
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
  vehiculo: Catalogo[] = [];
  allReserves: Reserva[] = [];
  todayStr: string = '';
  morningHours = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30'];
  afternoonHours = ['16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'];
  messageReserved: string | null = null;
  private authSubscription?: Subscription;
  private languageSubscription?: Subscription;
  private routerSubscription?: Subscription;

  constructor(
    public authService: AuthService,
    private router: Router,
    private languageService: LanguageService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    // Suscripción al idioma AQUI (no en constructor) para evitar detectChanges antes del init de la vista
    this.languageSubscription = this.languageService.isSpanish$.subscribe(isSpanish => {
      this.isSpanish = isSpanish;
      this.cdr.detectChanges();
    });

    this.checkUserAndLoadReserves();
    this.loadAllReserves();
    this.todayStr = new Date().toISOString().split('T')[0];

    this.authSubscription = this.authService.isLoggedIn$.subscribe(() => {
      this.checkUserAndLoadReserves();
    });

    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
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
    this.isLoading = true;
    const userId = this.authService.getUserId();
    if (!userId) {
      this.isLoading = false;
      return;
    }

    this.apiService.getReserveByUsuario(userId).subscribe({
      next: (response: any[]) => {
        const mapped = this.mapReservaResponse(response);
        this.reservasOriginales = this.sortReserves(mapped);
        this.reserves = [...this.reservasOriginales];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadAllReserves() {
    this.apiService.getReserves().subscribe({
      next: (response: any[]) => {
        this.allReserves = response.map((r: any) => ({
          ...r,
          usuario_id: r.usuarioId ?? r.usuario_id,
          vehiculo_id: r.vehiculo?.id ?? r.vehiculo_id,
          vehiculo_model: r.vehiculo_model ?? r.vehiculo?.model ?? ''
        }));
      },
      error: (err) => console.error('Error loading all reserves:', err)
    });
  }

  getReserveImage(reserve: Reserva): string {
    const images = reserve.vehiculo?.image_url;
    if (images && images.length > 0) {
      return images[0];
    }
    return '/images/hero_image.png';
  }
  /** Normaliza dia y hora a strings siempre, aunque vengan como Date u objeto */
  private norm(value: any): string {
    if (!value) return '';
    if (typeof value === 'string') return value.slice(0, 10); // toma solo YYYY-MM-DD si viene con tiempo
    if (value instanceof Date) {
      const mm = String(value.getMonth() + 1).padStart(2, '0');
      const dd = String(value.getDate()).padStart(2, '0');
      return `${value.getFullYear()}-${mm}-${dd}`;
    }
    return String(value);
  }

  private normHora(value: any): string {
    if (!value) return '00:00';
    if (typeof value === 'string') return value.slice(0, 5); // toma solo HH:mm
    if (value instanceof Date) {
      return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
    }
    return String(value);
  }

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
      const dia = this.norm(reserve.dia);
      const hora = this.normHora(reserve.hora);
      if (!dia) return false;
      const [year, month, day] = dia.split('-').map(Number);
      const [hours, minutes] = hora.split(':').map(Number);
      const fechaReserva = new Date(year, month - 1, day, hours, minutes);
      const isPast = fechaReserva < ahora;
      return tipo === 'activas' ? !isPast : isPast;
    });
  }

  // --- El resto sin cambios ---

  private sortReserves(reservas: Reserva[]): Reserva[] {
    return reservas.sort((a, b) => {
      const diaA = this.norm(a.dia);
      const diaB = this.norm(b.dia);
      const ordenDia = diaA.localeCompare(diaB);
      return ordenDia !== 0 ? ordenDia : this.normHora(a.hora).localeCompare(this.normHora(b.hora));
    });
  }

  private mapReservaResponse(response: any[]): Reserva[] {
    return response.map((r: any) => {
      return {
        ...r,
        vehiculo: r.vehiculo ? {
          id: r.vehiculo.id,
          marca: r.vehiculo.marca,
          modelo: r.vehiculo.model,
          year: r.vehiculo.year ?? 0,
          motor: r.vehiculo.motor ?? '',
          km: r.vehiculo.kms ?? r.vehiculo.km ?? 0,
          image_url: Array.isArray(r.vehiculo.image_url)
            ? r.vehiculo.image_url
            : [],
          precio: r.vehiculo.precio ?? '',
          description: r.vehiculo.description ?? '',
          is_favorite: r.vehiculo.is_favorite ?? false,
          reservas: r.vehiculo.reservas ?? [],
        } : undefined,
        usuario_id: r.usuario_id,
        vehiculo_id: r.vehiculo?.id ?? r.vehiculo_id,
        vehiculo_model: r.vehiculo_model ?? r.vehiculo?.model ?? '',
        valoracion_id: r.valoracion ?? r.valoracion_id ?? null,
        valoracion_comentario: r.valoracion_comentario ?? null,
        valoracion_servicio: r.valoracion_servicio ?? null,
        valoracion_fecha: r.valoracion_fecha ?? null,
      } as Reserva;
    });
  }

  isReservePast(reserve: Reserva): boolean {
    const dia = this.norm(reserve.dia);
    const hora = this.normHora(reserve.hora);
    if (!dia) return false;
    const [year, month, day] = dia.split('-').map(Number);
    const [hours, minutes] = hora.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes) < new Date();
  }

  deleteReserve(reserve: Reserva) {
    console.log("deleteReserve", reserve);
    this.selectedReserve = reserve;
    this.showModal = true;
  }

onConfirmDelete() {
  if (this.showModal) {
    this.showModal = false;
  }
  if (this.showDetailsModal) {
    this.showDetailsModal = false;
  }
  if (this.selectedReserve) {
    const reserveId = this.selectedReserve.id;
    this.deleteReservation(reserveId);
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
        this.loadUserReserves();
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
    if (!this.selectedReserve || !this.editedTime || !this.editedDay) {
      this.closeDetailsModal();
      return;
    }

    const reserveId = this.selectedReserve.id;
    const vehicleId = this.selectedReserve.vehiculo_id;
    const isSat = new Date(this.editedDay).getDay() === 6;
    const availableHours = isSat ? this.morningHours : this.morningHours.concat(this.afternoonHours);
    
    if(!availableHours.includes(this.editedTime)){
      const msgEs = isSat 
        ? 'Los sábados solo abrimos por la mañana (9:00 - 14:30).'
        : 'Escoge un horario disponible. Lunes a Viernes: 9:00-14:30 y 16:00-20:00.';
      const msgEn = isSat
        ? 'Saturdays only morning slots are available (9:00 - 2:30 PM).'
        : 'Choose a valid time slot. Mon-Fri: 9:00-14:30 and 16:00-20:00.';

      this.messageReserved = this.isSpanish ? msgEs : msgEn;
      setTimeout(() => {
        this.messageReserved = null;
      }, 2000);
      return;
    }
    if (this.isTimePastDetailed(this.editedDay, this.editedTime)) {
      this.messageReserved = this.getText('La fecha y hora elegidas ya han pasado.', 'The selected date and time have already passed.');
      setTimeout(() => {
        this.messageReserved = null;
      }, 2000);
      return;
    }

    if (this.isTimeReservedDetailed(this.editedDay, this.editedTime, vehicleId, reserveId)) {
      this.messageReserved = this.getText('Este horario ya está reservado para este vehículo.', 'This time slot is already reserved for this vehicle.');
      setTimeout(() => {
        this.messageReserved = null;
      }, 2000);
      return;
    }

    const updatedReserve: Reserva = { ...this.selectedReserve, dia: this.editedDay, hora: this.editedTime };

    this.apiService.editReserve(reserveId, updatedReserve).subscribe({
      next: () => {
        this.loadUserReserves();
        this.loadAllReserves(); // Recargar todo para actualizar disponibilidad
        this.showDetailsModal = false;
        this.selectedReserve = null;
      },
      error: (err) => {
        console.error('Error al actualizar la reserva:', err);
      }
    });
  }

  isTimePastDetailed(day: string, time: string): boolean {
    if (!day || !time) return false;
    const now = new Date();
    const [year, month, d] = day.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    const slotDateTime = new Date(year, month - 1, d, hours, minutes);
    return slotDateTime <= now;
  }

  isTimeReservedDetailed(day: string, time: string, vehicleId: number, currentReserveId: number): boolean {
    if (!day || !time) return false;
    return this.allReserves.some(reserve => {
      const dbDay = this.norm(reserve.dia);
      const dbTime = this.normHora(reserve.hora);
      return reserve.id !== currentReserveId && 
             dbDay === day && 
             dbTime === time && 
             Number(reserve.vehiculo_id) === Number(vehicleId);
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
  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.dropdown')) {
      this.showDropdown = false;
    }
  }
  getCountByType(tipo: 'activas' | 'expiradas'): number {
    const ahora = new Date();
    return this.reservasOriginales.filter(reserve => {
      const dia = this.norm(reserve.dia);
      const hora = this.normHora(reserve.hora);
      if (!dia) return false;
      const [year, month, day] = dia.split('-').map(Number);
      const [hours, minutes] = hora.split(':').map(Number);
      const fecha = new Date(year, month - 1, day, hours, minutes);
      return tipo === 'activas' ? fecha >= ahora : fecha < ahora;
    }).length;
  }

}
