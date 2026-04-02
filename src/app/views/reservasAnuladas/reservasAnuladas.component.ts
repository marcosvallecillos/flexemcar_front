import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { Catalogo, Reserva, ReservaAnulada, Usuario, Valoracion } from '../../models/user.interface';
import { LanguageService } from '../../services/language.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api-service.service';
import { ModalDeleteComponent } from '../../components/modal-delete/modal-delete.component';
import { AuthService } from '../../services/auth.service';
import { ModalUserComponent } from '../../components/modal-user/modal-user.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reservasAnuladas',
  imports: [ModalDeleteComponent,ModalUserComponent,CommonModule],
  templateUrl: './reservasAnuladas.component.html',
  styleUrl: './reservasAnuladas.component.css'
})
export class reservasAnuladas {
  valoracion: Valoracion[]= [];
  selectedValoracion: Valoracion |null = null
  reservasAnuladas: ReservaAnulada[] = [];
  isSpanish: boolean = true;
  isLoading: boolean = false;
  showLoginModal: boolean = false;
  selectedUserId: number | null = null;
  showModal: boolean = false;
  showModalDeleteAll:boolean = false;
  selectedReserve: ReservaAnulada | null = null;
  currentFilter: 'all' | 'activas' | 'expiradas' = 'all';
  filterError: string | null = null;
  reservasPorUsuario: { [usuarioId: number]: number } = {};
  usuariosPorId: { [usuarioId: number]: Usuario } = {};
  vehiculosPorId: { [vehiculoId: number]: Catalogo } = {};

  constructor(
    private languageService: LanguageService,
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.languageService.isSpanish$.subscribe(
      isSpanish => this.isSpanish = isSpanish
    );
  }

  getText(es: string, en: string): string {
    return this.isSpanish ? es : en;
  }
  ngOnInit(): void {
    this.getAllReservations();
    this.cargarUsuarios();
    this.cargarVehiculos();
  }
  getAllReservations() {
    this.isLoading = true;
    this.apiService.getReservasAnuladas().subscribe({ 
      next: (response) => {
        const mapped = this.mapReservaResponse(response);

        this.reservasAnuladas = mapped.sort((reserva, newreserve) => {
          const ordenardia = reserva.dia.localeCompare(newreserve.dia);
          return ordenardia !== 0 ? ordenardia : reserva.hora.localeCompare(newreserve.hora);
        });

        this.calcularReservasPorUsuario();
        this.enlazarUsuariosAReservas();
        this.enlazarVehiculosAReservas();

        this.reservasAnuladas.forEach(reservasAnuladas => {
          if (this.isReservePast(reservasAnuladas) && reservasAnuladas.valoracion_id != null) {
            this.deleteReserve(reservasAnuladas);
          } 
        });

        this.isLoading = false;
    this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al obtener reservas:', error);
      }
    });
  }

  private cargarUsuarios() {
    this.apiService.getAllUsers().subscribe({
      next: (usuarios) => {
        const user: { [usuarioId: number]: Usuario } = {};
        usuarios.forEach((u) => {
          if (u.id != null) {
            user[u.id] = u;
          }
        });
        this.usuariosPorId = user;
        this.enlazarUsuariosAReservas();
        
    this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar usuarios para las reservas:', error);
      }
    });
  }

  private enlazarUsuariosAReservas() {
    if (!this.reservasAnuladas?.length || !this.usuariosPorId) {
      return;
    }
    this.reservasAnuladas = this.reservasAnuladas.map((reservasAnuladas) => ({
      ...reservasAnuladas,
      usuario: reservasAnuladas.usuario_id != null ? this.usuariosPorId[reservasAnuladas.usuario_id] : reservasAnuladas.usuario,
    }));
  }

  private enlazarVehiculosAReservas() {
    if (!this.reservasAnuladas?.length || !this.vehiculosPorId) {
      return;
    }
    this.reservasAnuladas = this.reservasAnuladas.map((reservasAnuladas) => ({
      ...reservasAnuladas,
      vehiculo: reservasAnuladas.vehiculo_id != null ? this.vehiculosPorId[reservasAnuladas.vehiculo_id] : reservasAnuladas.vehiculo,
    }));
  }

  private cargarVehiculos() {
    this.apiService.getAllVehiculos().subscribe({
      next: (vehiculos) => {
        const vehicleMap: { [id: number]: Catalogo } = {};
        vehiculos.forEach((v) => {
          if (v.id != null) {
            vehicleMap[v.id] = v;
          }
        });
        this.vehiculosPorId = vehicleMap;
        this.enlazarVehiculosAReservas();
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error loading vehicles:', error)
    });
  }

  openUserModal(usuarioId: number) {
    this.selectedUserId = usuarioId;
    this.showLoginModal = true;
  }

  deleteReserve(reservasAnuladas: ReservaAnulada) {
    this.selectedReserve = reservasAnuladas;
    this.showModal = true;
  }
  deleteReserveAll(){
    this.showModalDeleteAll = true
    
  }


   
  private deleteReservation(reservasAnuladasId: number) {
    this.apiService.deleteReserve(reservasAnuladasId).subscribe({
      next: () => {
        this.reservasAnuladas = this.reservasAnuladas.filter(r => r.id !== reservasAnuladasId);
        this.calcularReservasPorUsuario();
        this.selectedReserve = null;
        this.showModal = false;
      },
      error: (error: Error) => {
        console.error('Error al eliminar la reserva:', error);
      }
    });
  }
  private deleteAllReserves() {
    this.apiService.deleteAllReserves().subscribe({
      next: () => {
        this.getAllReservations();
      },
      error: (error) => {
        console.error('Error al eliminar todas las reservas:', error);
      }
    });
  }

  // Calcula cuántas reservas tiene cada usuario (por usuario_id)
  // Incluye tanto reservas activas como borradas usando el endpoint del backend
  private calcularReservasPorUsuario() {
    const usuarioIdsUnicos = new Set<number>();
    this.reservasAnuladas.forEach((reservasAnuladas) => {
      if (reservasAnuladas.usuario_id != null) {
        usuarioIdsUnicos.add(reservasAnuladas.usuario_id);
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
          conteo[usuarioId] = respuesta.totalReservas || 0;
          llamadasCompletadas++;
          
          if (llamadasCompletadas === totalLlamadas) {
            this.reservasPorUsuario = conteo;
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error(`Error al obtener reservas para usuario ${usuarioId}:`, error);
          conteo[usuarioId] = 0;
          llamadasCompletadas++;
          
          if (llamadasCompletadas === totalLlamadas) {
            this.reservasPorUsuario = conteo;
            this.cdr.detectChanges();
          }
        }
      });
    });
  }

  isReservePast(reservasAnuladas: ReservaAnulada): boolean {
    const [year, month, day] = reservasAnuladas.dia.split('-').map(Number);
    const [hours, minutes] = reservasAnuladas.hora.split(':').map(Number);
    const reserveDate = new Date(year, month - 1, day, hours, minutes);
    return reserveDate < new Date();
  }

  allReservesPast(): boolean {
    return this.reservasAnuladas.length > 0 && this.reservasAnuladas.every(reservasAnuladas => this.isReservePast(reservasAnuladas));
  }
  deleteValoracion(reserveId: number) {
    if (this.selectedReserve && typeof this.selectedReserve.valoracion_id === 'number') {
      this.apiService.deleteValoracion(this.selectedReserve.valoracion_id).subscribe({
        error: (error) => console.error('Error al eliminar valoración:', error)
      });
    }
  }
  onConfirmDelete() {
    console.log(this.selectedReserve);
    if (this.selectedReserve) {
      this.deleteReservation(this.selectedReserve.id);
    }
  }

  onCancelReserve() {
    this.showModal = false;
    this.selectedReserve = null;
  }

  onConfirmDeleteAll() {
    this.deleteAllReserves();
  }

  onCancelDeleteAll() {
    this.showModalDeleteAll = false;
  }

  showDropdown = false;

  toggleDropdown(event: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.showDropdown = !this.showDropdown;
    this.cdr.detectChanges();
  }

  filtrar(tipo: 'all' | 'activas' | 'expiradas') {
    this.isLoading = true;
    this.filterError = null;
    this.currentFilter = tipo;

    if (tipo === 'all') {
      this.getAllReservations();
      return;
    }

    const filterMethod = tipo === 'activas' 
      ? this.apiService.filterReserveActivas()
      : this.apiService.filterReserveExpiradas();

    filterMethod.subscribe({
      next: (reservas) => {
        const mapped = this.mapReservaResponse(reservas);

        this.reservasAnuladas = mapped.sort((reserva, newreserve) => {
          const ordenardia = reserva.dia.localeCompare(newreserve.dia);
          return ordenardia !== 0 ? ordenardia : reserva.hora.localeCompare(newreserve.hora);
        });

        this.calcularReservasPorUsuario();
        this.enlazarUsuariosAReservas();
        this.isLoading = false;
        this.showDropdown = false;
      },
      error: (error) => {
        console.error('Error al filtrar reservas:', error);
        this.filterError = this.getText(
          'Error al filtrar las reservas. Por favor, intente de nuevo.',
          'Error filtering reservations. Please try again.'
        );
        this.isLoading = false;
        this.showDropdown = false;
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.dropdown')) {
      this.showDropdown = false;
      this.cdr.detectChanges();
    }
  }

  private mapReservaResponse(response: any[]): ReservaAnulada[] {
    return response.map((r: any) => {
      let vehiculo = r.vehiculo;
      
      // Si el backend devuelve un objeto vehiculo, lo mapeamos
      if (vehiculo && typeof vehiculo === 'object') {
        vehiculo = {
          id: vehiculo.id,
          marca: vehiculo.marca,
          modelo: vehiculo.model || vehiculo.modelo || '',
          year: vehiculo.year ?? 0,
          motor: vehiculo.motor ?? '',
          km: vehiculo.kms ?? vehiculo.km ?? 0,
          image_url: Array.isArray(vehiculo.image_url) ? vehiculo.image_url : [],
          precio: vehiculo.precio ?? '',
          description: vehiculo.description ?? '',
        };
      } else {
        vehiculo = undefined;
      }

      return {
        ...r,
        vehiculo: vehiculo,
        usuario_id: r.usuarioId ?? r.usuario_id,
        vehiculo_id: r.vehiculo?.id ?? r.vehiculo_id ?? r.vehicle_id,
        vehiculo_model: r.vehiculo_model ?? r.vehiculo?.model ?? r.vehiculo?.modelo ?? '',
        valoracion_id: r.valoracion ?? r.valoracion_id ?? null,
      } as ReservaAnulada;
    });
  }
  
  getCountByType(tipo: 'activas' | 'expiradas'): number {
    const ahora = new Date();
    return this.reservasAnuladas.filter(reservasAnuladas => {
      const [year, month, day] = reservasAnuladas.dia.split('-').map(Number);
      const [hours, minutes] = reservasAnuladas.hora.split(':').map(Number);
      const fecha = new Date(year, month - 1, day, hours, minutes);
      return tipo === 'activas' ? fecha >= ahora : fecha < ahora;
    }).length;
  }
}
