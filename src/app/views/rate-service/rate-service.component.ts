import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api-service.service';
import { AuthService } from '../../services/auth.service';
import { Valoracion, Reserva } from '../../models/user.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { Vehicles } from '../../components/vehicles/vehicles';

@Component({
    selector: 'app-rate-service',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './rate-service.component.html',
    styleUrls: ['./rate-service.component.css']
})
export class RateServiceComponent implements OnInit {
    servicioRating: number = 0;
    comentario: string = '';
    rating: number = 0;
    formSubmitted: boolean = false;
    valoracion: Valoracion[] = [];
    showAlert: boolean = false;
    isProcessing: boolean = false;
    isSpanish: boolean = true;
    reservaValidada: boolean = false;
    yaValorada: boolean = false;         
    isEditMode: boolean = false;        
    originalRating: number = 0;           
    originalComentario: string = '';      
    isLoadingReserve: boolean = true;
    errorLoadingReserve: boolean = false;
    errorMessage: string = '';
    reserves: Reserva[] = [];

    @Output() confirm = new EventEmitter<void>();
    reserve: Reserva | null = null;

    constructor(
        private apiService: ApiService,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private languageService: LanguageService,
        private cdr: ChangeDetectorRef
    ) {
        this.languageService.isSpanish$.subscribe(
            isSpanish => {
                this.isSpanish = isSpanish;
            }
        );
    }

    ngOnInit() {
        // Obtener el ID de la ruta usando paramMap (más confiable)
        this.route.paramMap.subscribe(params => {
            const reserveIdParam = params.get('id');
console.log('Image URL:', this.reserve?.vehiculo?.image_url);
            if (reserveIdParam) {
                const reserveId = Number(reserveIdParam);
                console.log('ID convertido a número:', reserveId);
                
                if (!isNaN(reserveId) && reserveId > 0) {
                    this.loadReserve(reserveId);
                } else {
                    this.showError(this.getText(
                        'El ID de reserva no es válido.',
                        'The reservation ID is not valid.'
                    ));
                }
            } else {
                // Intentar desde snapshot como fallback
                const snapshotId = this.route.snapshot.params['id'] || 
                                  this.route.snapshot.paramMap.get('id');
                
                
                if (snapshotId) {
                    const id = Number(snapshotId);
                    if (!isNaN(id) && id > 0) {
                        this.loadReserve(id);
                    } else {
                        this.showError(this.getText(
                            'El ID de reserva no es válido.',
                            'The reservation ID is not valid.'
                        ));
                    }
                } else {
                    this.showError(this.getText(
                        'No se proporcionó un ID de reserva válido. Por favor, vuelve a intentar desde la página de reservas.',
                        'No valid reservation ID was provided. Please try again from the reservations page.'
                    ));
                }
            }
        });
    }
getReserveImage(reserve: Reserva): string {
  const images = reserve.vehiculo?.image_url;
  if (images && images.length > 0) {
    return images[0]; // ← sin añadir backendUrl, ya viene completa
  }
      console.log("Iamgen",images)

  return '/images/hero_image.png';
}
    private showError(message: string) {
        this.errorLoadingReserve = true;
        this.errorMessage = message;
        this.isLoadingReserve = false;
        // Usar setTimeout para evitar el error de "update mode"
        setTimeout(() => {
            this.cdr.detectChanges();
        }, 0);
    }

    loadReserve(reserveId: number) {
        this.isLoadingReserve = true;
        this.errorLoadingReserve = false;
        this.errorMessage = '';

        console.log('Cargando reserva con ID:', reserveId);

        this.apiService.getReserveById(reserveId).subscribe({
            next: (reserve) => {
                console.log('Reserva obtenida:', reserve);
                this.reserve = reserve;

               this.yaValorada = !!reserve.valoracion;

if (this.yaValorada) {
    this.servicioRating = reserve.valoracion_servicio ?? 0;
    this.comentario = reserve.valoracion_comentario ?? '';
    this.originalRating = this.servicioRating;
    this.originalComentario = this.comentario;
    this.isEditMode = false;
} else {
    // No hay valoración → modo creación
    this.servicioRating = 0;
    this.comentario = '';
    this.originalRating = 0;
    this.originalComentario = '';
    this.isEditMode = true;
}

                this.isLoadingReserve = false;
                setTimeout(() => {
                    this.cdr.detectChanges();
                }, 0);
            },
            error: (error) => {
                console.error('Error al obtener la reserva:', error);
                this.errorLoadingReserve = true;
                this.isLoadingReserve = false;
                this.errorMessage = this.getText(
                    'No se pudo obtener la reserva seleccionada. Por favor, inténtalo de nuevo.',
                    'Could not get the selected reservation. Please try again.'
                );
                setTimeout(() => {
                    this.cdr.detectChanges();
                }, 0);
            }
        });
    }

    retryLoadReserve() {
        const reserveIdParam = this.route.snapshot.params['id'] || 
                                this.route.snapshot.paramMap.get('id') ||
                                this.route.snapshot.queryParams['id'];
        
        if (reserveIdParam) {
            const reserveId = Number(reserveIdParam);
            if (!isNaN(reserveId) && reserveId > 0) {
                this.loadReserve(reserveId);
            } else {
                this.showError(this.getText(
                    'El ID de reserva no es válido.',
                    'The reservation ID is not valid.'
                ));
            }
        } else {
            this.showError(this.getText(
                'No se proporcionó un ID de reserva válido.',
                'No valid reservation ID was provided.'
            ));
        }
    }

    goBack() {
        this.router.navigate(['/show-catalogo']);
    }

    getText(es: string, en: string): string {
        return this.isSpanish ? es : en;
    }

    onRatingChange(tipo: 'servicio',valor: number): void {
        if (tipo === 'servicio') {
            this.servicioRating = valor;
        } 
    }

    reiniciarValoraciones(): void {
        if (this.yaValorada) {
            // Si estamos editando una valoración existente, volvemos a lo original
            this.servicioRating = this.originalRating;
            this.comentario = this.originalComentario;
        } else {
            this.servicioRating = 0;
            this.comentario = '';
        }
        this.formSubmitted = false;
    }
    getRatingLabel(): string {
  const labels = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'];
  return this.servicioRating > 0 ? labels[this.servicioRating] : 'Sin valorar';
}

    startEdit(): void {
        this.isEditMode = true;
    }

    cancelEdit(): void {
        this.isEditMode = false;
        this.servicioRating = this.originalRating;
        this.comentario = this.originalComentario;
    }

    onSubmit(): void {
        if (!this.comentario.trim()) {
            alert(this.getText('Por favor, escribe un comentario.', 'Please write a comment.'));
            return;
        }

        if (this.servicioRating === 0) {
            alert(this.getText('Por favor, selecciona una calificación con estrellas.', 'Please select a star rating.'));
            return;
        }
    
        const userId = this.authService.getUserId();
        if (!userId) {
            alert(this.getText('No se pudo obtener el ID del usuario. Inicia sesión nuevamente.', 'Could not get user ID. Please log in again.'));
            return;
        }
    
        if (!this.reserve) {
            alert(this.getText('No se pudo obtener la reserva seleccionada. Por favor, inténtalo de nuevo.', 'Could not get the selected reservation. Please try again.'));
            return;
        }

        this.isProcessing = true;
        this.formSubmitted = true;
    
        const fechaActual = new Date().toISOString();
        
        const valoracionData: any = {
            rating: this.servicioRating,
            comment: this.comentario,
            usuario_id: userId,
            reserva_id: this.reserve.id,
            created_at: fechaActual
        };

   if (!this.reserve.valoracion) {
    alert(this.getText('No se encontró la valoración a editar.', 'Rating not found.'));
    return;
}
console.log('Enviando valoración al backend:', valoracionData);
        
        this.apiService.editValoracion(this.reserve.valoracion,valoracionData).subscribe({
            next: (response) => {
                console.log('Valoración enviada exitosamente:', response);
                
                this.reiniciarValoraciones();
                this.showAlert = true;
                this.isProcessing = false;
                this.cdr.detectChanges();
                
                setTimeout(() => {
                    this.router.navigate(['/show-catalogo']);
                }, 2000);
            },
            error: (error) => {
                console.error('Error al enviar la valoración:', error);
                alert(this.getText('Error al enviar la valoración. Por favor, inténtalo de nuevo más tarde.', 'Error sending rating. Please try again later.'));
                this.isProcessing = false;
                this.showAlert = false;
                this.cdr.detectChanges();
            }
        });
    }
}