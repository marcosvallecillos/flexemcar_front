import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api-service.service';
import { Catalogo } from '../../models/user.interface';

@Component({
  selector: 'app-search-vehicle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-vehicle.html',
  styleUrl: './search-vehicle.css',
})
export class SearchVehicle implements OnInit {

  // All vehicles data (to extract marcas/modelos)
  allVehicles: Catalogo[] = [];

  // Dropdown options
  marcas: string[] = [];
  modelos: string[] = [];

  // Filter values
  selectedMarca: string = '';
  selectedModelo: string = '';
  precioMin: number = 0;
  precioMax: number = 50000;

  // Slider config
  readonly PRICE_MIN = 0;
  readonly PRICE_MAX = 50000;
  readonly PRICE_STEP = 500;

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.apiService.getAllVehiculos().subscribe({
      next: (data: Catalogo[]) => {
        this.allVehicles = data;
        // Extract unique marcas
        this.marcas = [...new Set(data.map(v => v.marca).filter(m => m))].sort();
      },
      error: (err) => {
        console.error('Error cargando vehículos:', err);
      }
    });
  }

  onMarcaChange() {
    // Reset modelo when marca changes
    this.selectedModelo = '';
    
    if (this.selectedMarca) {
      // Filter modelos by selected marca
      this.modelos = [...new Set(
        this.allVehicles
          .filter(v => v.marca === this.selectedMarca)
          .map(v => v.modelo)
          .filter(m => m)
      )].sort();
    } else {
      this.modelos = [];
    }
  }

  // Format price for display
  formatPrice(value: number): string {
    return value.toLocaleString('es-ES') + ' €';
  }

  // Handle min slider change
  onMinPriceChange(event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    if (value > this.precioMax) {
      this.precioMin = this.precioMax;
    } else {
      this.precioMin = value;
    }
  }

  // Handle max slider change
  onMaxPriceChange(event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    if (value < this.precioMin) {
      this.precioMax = this.precioMin;
    } else {
      this.precioMax = value;
    }
  }

  // Calculate range fill percentage for slider track
  get sliderMinPercent(): number {
    return (this.precioMin / this.PRICE_MAX) * 100;
  }

  get sliderMaxPercent(): number {
    return (this.precioMax / this.PRICE_MAX) * 100;
  }

  onSubmit() {
    const queryParams: any = {};

    if (this.selectedMarca) queryParams.marca = this.selectedMarca;
    if (this.selectedModelo) queryParams.modelo = this.selectedModelo;
    if (this.precioMin > 0) queryParams.precioMin = this.precioMin;
    if (this.precioMax < this.PRICE_MAX) queryParams.precioMax = this.precioMax;

    this.router.navigate(['/show-vehicles'], { queryParams });
  }
}
