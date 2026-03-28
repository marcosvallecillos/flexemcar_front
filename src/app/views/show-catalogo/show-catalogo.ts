import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api-service.service';
import { Catalogo } from '../../models/user.interface';
import { UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-show-catalogo',
  imports: [UpperCasePipe, RouterLink],

  templateUrl: './show-catalogo.html',
  styleUrl: './show-catalogo.css',
})
export class ShowCatalogo implements OnInit {
  isUser = false;
  isLoading: boolean = false;
  vehicles: Catalogo[] = [];
  filteredVehicles: Catalogo[] = [];
  backendUrl = 'http://localhost:8000';
  marcas: string[] = [];

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.getAllVehicles();
  }

  getAllVehicles() {
    this.isLoading = true;
    this.apiService.getAllVehiculos().subscribe({
      next: (data: Catalogo[]) => {
        this.vehicles = data;
        this.filteredVehicles = [...data];
        this.marcas = [...new Set(data.map(v => v.marca))];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getVehicleImage(vehicle: Catalogo): string {
    if (vehicle.image_url && vehicle.image_url.length > 0) {
      return this.backendUrl + vehicle.image_url[0];
    }
    return '/images/hero_image.png';
  }

  eliminarVehiculo(id:number){
    this.apiService.deleteVehiculo(id).subscribe({
      next: () => {
        this.getAllVehicles();
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });
  }
}

