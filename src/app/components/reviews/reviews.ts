import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { Reserva } from '../../models/user.interface';
import { Valoracion } from '../../models/user.interface';

import { ApiService } from '../../services/api-service.service';

interface Review {
  id: number;
  stars: number;
  text: string;
  reviewerName: string;
  reviewerCompany: string;
  reviewerInitials: string;
  featured?: boolean;
}

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reviews.html',
  styleUrl: './reviews.css',
})
export class Reviews implements OnInit {
  
  showUserModal: boolean = false;
  showReservaModal: boolean = false;
  valoraciones: Valoracion[] = [];
  isLoading: boolean = false;
  isSpanish: boolean = true;
  selectedReservaId: number | null = null;
  selectedUserId: number | null = null;
  selectedReserveId: number | null = null;
  selectedReserve: Reserva | null = null;

  constructor(
    private languageService: LanguageService, 
    private apiService: ApiService,
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
    this.getAllValoraciones();
  }

  getAllValoraciones() {
    this.isLoading = true;
    this.apiService.getValoraciones().subscribe({
      next: (response) => {
        console.log('Respuesta completa del API:', response);
        if (response && response.valoraciones && Array.isArray(response.valoraciones)) {
          this.valoraciones = response.valoraciones.map(valoracion => ({
            ...valoracion,
            usuario_id: valoracion.usuario?.id || valoracion.usuario_id,
            reserva_id: valoracion.reserva?.id || valoracion.reserva_id
          })).sort((a, b) => {
            // Ordenar por fecha más reciente primero
            const dateA = new Date(a.fecha).getTime();
            const dateB = new Date(b.fecha).getTime();
            return dateB - dateA;
          });
          console.log('Valoraciones procesadas:', this.valoraciones);
        } else {
          this.valoraciones = [];
          console.log('No se encontraron valoraciones en la respuesta');
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al obtener valoraciones:', error);
        this.valoraciones = [];
        this.cdr.detectChanges();
      }
    });
  }

  getInitials(nombre?: string, apellidos?: string): string {
    if (!nombre && !apellidos) return '??';
    const firstInitial = nombre ? nombre.charAt(0).toUpperCase() : '';
    const lastInitial = apellidos ? apellidos.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(this.isSpanish ? 'es-ES' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  getStars(rating: number | null | undefined): string {
    if (rating === null || rating === undefined) {
      return '☆☆☆☆☆';
    }
    const fullStar = '★';
    const emptyStar = '☆';
    return fullStar.repeat(rating) + emptyStar.repeat(5 - rating);
  }
}
