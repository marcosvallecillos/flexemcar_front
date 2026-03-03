import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { UserStateService } from '../../services/user-state.service';

@Component({
  selector: 'app-modal-delete',
  imports: [],
  templateUrl: './modal-delete.component.html',
  styleUrl: './modal-delete.component.css'
})
export class ModalDeleteComponent {
   @Input() show: boolean = false;
  @Input() fecha: string | null = '';
  @Input() hora: string = '';
  @Input() servicio: string = '';
  @Input() peluquero: string = '';
  @Input() usuario: number | null = null;
  @Input() nombreUsuario: string | null = '';
  @Input() apellidoUsuario: string | null = '';
  isAdmin: boolean = false;
  isProcessing: boolean = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  constructor(private languageService: LanguageService, private userStateService: UserStateService) {
    this.languageService.isSpanish$.subscribe(
      isSpanish => this.isSpanish = isSpanish
    );
  }

  ngOnInit() {
    this.isAdmin = this.userStateService.getIsAdmin();
  }

  onCancel() {
    this.cancel.emit();
    this.isProcessing = false;
  }

  onConfirm() {
    this.isProcessing = true;
    setTimeout(() => {
      this.isProcessing = false;
    }, 2000);
    this.confirm.emit();
  }

  isSpanish: boolean = true;

  getText(es: string, en: string): string {
    return this.isSpanish ? es : en;
  }

  // Comprueba si una reserva está en el pasado a partir de fecha y hora (strings)
  isReservePast(dia: string | null, hora: string): boolean {
    if (!dia || !hora) return false;

    const [year, month, day] = dia.split('-').map(Number);
    const [hours, minutes] = hora.split(':').map(Number);

    if (!year || !month || !day || isNaN(hours) || isNaN(minutes)) {
      return false;
    }

    const reserveDate = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();

    return reserveDate < now;
  }
}
