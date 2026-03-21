import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api-service.service';
import { LanguageService } from '../../services/language.service';
import { Router } from '@angular/router';
import { Valoracion, ValoracionesResponse } from '../../models/user.interface';

@Component({
  selector: 'app-modal-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-user.component.html',
  styleUrl: './modal-user.component.css'
})
export class ModalUserComponent implements OnChanges {
  @Input() show: boolean = false;
  @Input() id: number | null = null;
  @Input() nombre: string | null = '';
  @Input() apellidos: string | null = '';
  @Input() email: string | null = '';
  @Input() telefono: string | null = '';
  @Input() rol: string | null = '';
  @Output() close = new EventEmitter<void>();
  
  isSpanish: boolean = true;
  isLoading: boolean = false;

  constructor(
    private languageService: LanguageService,
    private router: Router, 
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {
    this.languageService.isSpanish$.subscribe(
      isSpanish => this.isSpanish = isSpanish
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['show'] && changes['show'].currentValue && this.id) {
      this.loadUserData();
    }
  
  }

  loadUserData() {
    if (!this.id) return;
    this.isLoading = true;
    this.apiService.showProfile(this.id).subscribe({
      next: (usuario) => {
        this.nombre = usuario.nombre || '';
        this.apellidos = usuario.apellidos || '';
        this.email = usuario.email || '';
        this.telefono = usuario.telefono?.toString() || '';
        this.rol = usuario.rol || '';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar datos del usuario:', error);
        this.isLoading = false;
      }
    });
  }

  getText(es: string, en: string): string {
    return this.isSpanish ? es : en;
  }

  onClose() {
    this.close.emit();
  }
}
