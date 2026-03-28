import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api-service.service';
import { Catalogo } from '../../models/user.interface';

@Component({
  selector: 'app-create-vehicle',
  imports: [RouterLink, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-vehicle.html',
  styleUrl: './create-vehicle.css'
})
export class CreateVehicle {
  isProcessing: boolean = false;
  showAlert: boolean = false;

  @Output() confirm = new EventEmitter<void>();

  vehicleForm = new FormGroup({
    marca: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    modelo: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    year: new FormControl<number>(new Date().getFullYear(), { nonNullable: true, validators: [Validators.required, Validators.min(1900)] }),
    motor: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    km: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    precio: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
    image_url: new FormControl('', { nonNullable: true }) // Stored simple string format for MVP
  });

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit() {
    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }

    const payload = {
      marca: this.vehicleForm.getRawValue().marca,
      modelo: this.vehicleForm.getRawValue().modelo,
      year: this.vehicleForm.getRawValue().year,
      motor: this.vehicleForm.getRawValue().motor,
      km: this.vehicleForm.getRawValue().km,
      precio: this.vehicleForm.getRawValue().precio,
      descripcion: this.vehicleForm.getRawValue().description,
      images: this.vehicleForm.getRawValue().image_url ? [this.vehicleForm.getRawValue().image_url] : [],
      is_favorite: false
    };

    this.isProcessing = true;
    this.cdr.detectChanges();

    this.apiService.createVehiculo(payload).subscribe({
      next: (response) => {
        this.showAlert = true;
        setTimeout(() => {
          this.showAlert = false;
          this.confirm.emit();
          this.router.navigate(['/admin/catalogo']);
        }, 3000);
      },
      error: (error) => {
        this.isProcessing = false;
        console.error("Error al crear el vehiculo.", error);
        this.cdr.detectChanges();
      }
    });
  }

  getControl(controlName: string) {
    return this.vehicleForm.get(controlName);
  }
}
