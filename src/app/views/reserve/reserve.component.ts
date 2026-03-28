import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api-service.service';
import { Reserva } from '../../models/user.interface';

@Component({
  selector: 'app-reserve',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reserve.component.html',
  styleUrls: ['./reserve.component.css'],
})
export class ReserveComponent implements OnInit {
  currentDate = new Date();
  reserves: Reserva[] = [];
  selectedDate: Date | null = null;
  estado: string = 'pendiente';
  selectedVehicle: string = 'Mercedes-Benz Sprinter';
  selectedTime: string = '';
  vehicleId: number = 0;
  isEditing: boolean = false;
  reserveId: number | null = null;

  morningHours = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30'];
  afternoonHours = ['16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'];

  isSaturday(date: Date | null): boolean {
    if (!date) return false;
    return date.getDay() === 6;
  }

  weekDays = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];

  isLoading: boolean = true;
  isAuthenticated = false;

  vehicleDetails = {
    id: 0,
    usuario_id: 0,
    estado: 'pendiente',
    name: 'Mercedes-Benz Sprinter',
    year: '2023',
    usage: 'CARGA PESADA',
    image: '/images/hero_image.png'
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private apiService: ApiService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.isAuthenticated = this.authService.isLoggedIn();
    if (!this.isAuthenticated) {
      // this.router.navigate(['/']); 1
    }

    this.loadReserves();

    this.route.queryParams.subscribe(params => {
      console.log('=== PARAMS RECIBIDOS EN RESERVE ===', params);

      if (params['estado']) {
        this.estado = params['estado'];
        this.vehicleDetails.estado = params['estado'];
      }
      // Leer vehicle_id como string primero y convertir
      const rawId = params['vehicle_id'];
      if (rawId !== undefined && rawId !== null && rawId !== '') {
        this.vehicleId = Number(rawId);
        this.vehicleDetails.id = this.vehicleId;
        console.log('vehicle_id leído desde URL:', this.vehicleId);
      }
      if (params['vehiculo']) {
        this.selectedVehicle = params['vehiculo'];
        this.vehicleDetails.name = params['vehiculo'];
      }
      if (params['imagen']) {
        this.vehicleDetails.image = params['imagen'];
      }
      if (params['marca']) {
        this.vehicleDetails.usage = params['marca'].toUpperCase();
      }
      if (params['year']) {
        this.vehicleDetails.year = params['year'];
      }
      // Datos de edición de una reserva existente (rid = reserve_id)
      if (params['rid']) {
        this.isEditing = true;
        this.reserveId = Number(params['rid']);
        if (params['dia']) {
          const [year, month, day] = params['dia'].split('-').map(Number);
          this.selectedDate = new Date(year, month - 1, day);
          this.currentDate = new Date(year, month - 1, 1);
        }
        if (params['hora']) {
          this.selectedTime = params['hora'];
        }
      }
    });
    this.isLoading = false;
  }

  loadReserves() {
    this.apiService.getReserves().subscribe({
      next: (response) => {
        this.reserves = response.map((r: any) => ({
          ...r,
          usuario_id: r.usuarioId ?? r.usuario_id,
          vehiculo_id: r.vehiculo?.id ?? r.vehiculo_id,
          vehiculo_model: r.vehiculo_model ?? r.vehiculo?.model ?? ''
        }));
      },
      error: (e) => console.error('Error loading reserves', e)
    });
  }

  getDaysInMonth(): (Date | null)[] {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    let firstDayOfWeek = firstDay.getDay();

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      days.push(date);
    }
    return days;
  }
  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0; // Solo domingos cerrados
  }

  isAvailable(date: Date): boolean {
    if (!date || !this.selectedVehicle) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = date < today;
    const isWeekendDay = this.isWeekend(date);
    const isFullyBooked = this.isDayFullyBooked(date);
    return !isPast && !isWeekendDay && !isFullyBooked;
  }

  isDayFullyBooked(date: Date): boolean {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateStr = this.formatearFecha(year, month, day);

    const bookingsForDay = this.reserves.filter(reserve => {
      const matchDia = reserve.dia?.startsWith(dateStr);
      const matchVehiculo = Number(reserve.vehiculo_id) === Number(this.vehicleId);
      return matchDia && matchVehiculo;
    });
    const totalPossibleSlots = (this.morningHours.length + this.afternoonHours.length);
    return bookingsForDay.length >= totalPossibleSlots;
  }

  isTimeReserved(time: string): boolean {
    if (!this.selectedDate || !this.selectedVehicle) return false;

    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth() + 1;
    const day = this.selectedDate.getDate();
    const dateStr = this.formatearFecha(year, month, day);

    // Verificar si hay alguna reserva que coincida con la fecha, hora y vehículo
    const found = this.reserves.some(reserve => {
      const isSameDay = reserve.dia?.startsWith(dateStr);
      const isSameTime = reserve.hora?.startsWith(time.trim());
      const isSameVehicle = Number(reserve.vehiculo_id) === Number(this.vehicleId);

      return isSameDay && isSameTime && isSameVehicle;
    });

    if (found) {
      console.log(`[RESERVE] Slot ocupado: ${dateStr} ${time} para vehículo ${this.vehicleId}`);
    }

    return found;
  }


  isTimePast(time: string): boolean {
    if (!this.selectedDate) return false;
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateStart = new Date(this.selectedDate);
    selectedDateStart.setHours(0, 0, 0, 0);


    if (selectedDateStart < today) {
      return true;
    }

    // Averiguar si la hora se ha pasado de la hora actual

    if (selectedDateStart.getTime() == today.getTime()) {
      const [hours, minutes] = time.split(':').map(Number);
      const slotDateTime = new Date(this.selectedDate);
      slotDateTime.setHours(hours, minutes, 0, 0);
      return slotDateTime <= now;
    }

    return false;
  }

  isTimeAvailable(time: string): boolean {
    return !this.isTimeReserved(time) && !this.isTimePast(time);
  }

  isDateSelected(date: Date | null): boolean {
    if (!date || !this.selectedDate) return false;
    return date.getTime() === this.selectedDate.getTime();
  }

  selectDate(date: Date | null) {
    if (date && this.isAvailable(date)) {
      this.selectedDate = date;
      this.selectedTime = '';
    }
  }

  selectTime(time: string) {
    this.selectedTime = time;
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
  }

  prevMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
  }

  getMonthName(): string {
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  formatearFecha(year: number, month: number, day: number): string {
    const mm = (month < 10 ? '0' : '') + month;
    const dd = (day < 10 ? '0' : '') + day;
    return `${year}-${mm}-${dd}`;
  }

  /** Convierte "09:00 AM" / "02:00 PM" al formato H:i que espera el backend */
  convertirHora(time: string): string {
    const trimmed = time.trim();
    const match = trimmed.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
    if (!match) return trimmed; // ya está en formato 24h
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = match[3].toUpperCase();
    if (period === 'AM' && hours === 12) hours = 0;
    if (period === 'PM' && hours !== 12) hours += 12;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  confirmReserve() {
    const userId = this.authService.getUserId();
    if (!this.selectedDate || !this.selectedTime || !userId) return;

    console.log('=== CONFIRM RESERVE ===');
    console.log('vehicleId:', this.vehicleId);
    console.log('selectedVehicle:', this.selectedVehicle);
    console.log('selectedTime:', this.selectedTime);

    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth() + 1;
    const day = this.selectedDate.getDate();
    const formattedDate = this.formatearFecha(year, month, day);
    const formattedHora = this.convertirHora(this.selectedTime);

    const reserveData: any = {
      vehicle_id: this.vehicleId,
      vehiculo_model: this.selectedVehicle,
      estado: 'pendiente',
      dia: formattedDate,
      hora: formattedHora,
      usuario_id: userId,
    };

    console.log('Payload enviado al backend:', reserveData);

    if (this.isEditing && this.reserveId) {
      this.apiService.editReserve(this.reserveId, reserveData).subscribe({
        next: () => this.router.navigate(['/show-reserve']),
        error: (e) => console.error('Error editReserve:', e)
      });
    } else {
      this.apiService.newReserve(reserveData).subscribe({
        next: () => this.router.navigate(['/show-reserves']),
        error: (e) => console.error('Error newReserve:', e)
      });
    }
  }
}