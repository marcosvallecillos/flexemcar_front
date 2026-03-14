import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { ApiService } from '../../services/api-service.service';
import { Router, RouterLink } from '@angular/router';
import { UserStateService } from '../../services/user-state.service';
import { Footer } from '../../components/footer/footer';
import { Catalogo } from '../../models/user.interface';
import { DecimalPipe, NgClass, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-show-vehicles',
  imports: [Footer, NgClass, DecimalPipe, UpperCasePipe],
  templateUrl: './show-vehicles.html',
  styleUrl: './show-vehicles.css',
})
export class ShowVehicles implements OnInit {
  isUser = false;

  isLoading: boolean = false;
  vehicles: Catalogo[] = [];
  filteredVehicles: Catalogo[] = [];
  isSpanish: boolean = true;
  backendUrl = 'http://localhost:8000';

  marcas: string[] = [];
  selectedMarca: string = 'Todas';
  selectedPrice: string = 'Todos';
  messageNoUser: string = '';
  messageNoUserDisplay: string | null = null;
  priceRanges = [
    { label: '< 25.000 €', key: 'lt25' },
    { label: '25.000 - 35.000 €', key: '25to35' },
    { label: '> 35.000 €', key: 'gt35' },
  ];

  constructor(
    private languageService: LanguageService,
    private apiService: ApiService,
    private router: Router,
    private userStateService: UserStateService,
    private cdr: ChangeDetectorRef,
  ) {
    this.languageService.isSpanish$.subscribe(i => this.isSpanish = i);

    // Escuchar cambios de sesión para saber si hay usuario logueado
    this.userStateService.isUser$.subscribe(isUser => {
      this.isUser = isUser;
      this.cdr.detectChanges();
    });
  }

  ngOnInit() {
    // Estado inicial de usuario (por si ya estaba logueado antes de entrar)
    this.isUser = this.userStateService.getIsUser();
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

  filterByMarca(marca: string) {
    this.selectedMarca = marca;
    this.applyFilters();
  }

  filterByPrice(key: string) {
    this.selectedPrice = key;
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.vehicles];
    if (this.selectedMarca !== 'Todas') {
      result = result.filter(v => v.marca === this.selectedMarca);
    }
    if (this.selectedPrice !== 'Todos') {
      result = result.filter(v => {
        const price = parseFloat(v.precio);
        if (this.selectedPrice === 'lt25')   return price < 25000;
        if (this.selectedPrice === '25to35') return price >= 25000 && price <= 35000;
        if (this.selectedPrice === 'gt35')   return price > 35000;
        return true;
      });
    }
    this.filteredVehicles = result;
  }

  verDetalles(id: number) {
    this.router.navigate(['/http://localhost:8000/api/vehicles/', id]);
  }

  favorite(vehicle: Catalogo): void {
    if (!this.isUser) {
      this.messageNoUserDisplay = this.getText('Deberás iniciar sesión para realizar esta función', 'You must log in to do this function.');
      setTimeout(() => {
        this.messageNoUserDisplay = null;
      }, 2000);
      return;
    }

    // Cambiar el estado de favorite
    vehicle.is_favorite = !vehicle.is_favorite;
    
    // Actualizar el producto en la base de datos
    this.apiService.updateVehiculoFavorite(vehicle.id, vehicle.is_favorite ? true : false).subscribe({
      next: (response: any) => {
        if (vehicle.is_favorite) {
          this.apiService.addFavorite({ ...vehicle });
        } else {
          this.apiService.deleteVehiculoFav(vehicle.id);
        }
      },
      error: (error: any) => {
        console.error('Error al actualizar favorito:', error);
        // Revertir el cambio si hay error
        vehicle.is_favorite = !vehicle.is_favorite;
        this.messageNoUserDisplay = this.getText(
          'Error al actualizar favoritos',
          'Error updating favorites'
        );
      }
    });
  }
  getText(es: string, en: string): string {
    return this.isSpanish ? es : en;
  }
  carouselIndex: Record<string, number> = {};

nextSlide(id: string, total: number) {
  this.carouselIndex[id] = ((this.carouselIndex[id] || 0) + 1) % total;
}

prevSlide(id: string, total: number) {
  this.carouselIndex[id] = ((this.carouselIndex[id] || 0) - 1 + total) % total;
}

setSlide(id: string, index: number) {
  this.carouselIndex[id] = index;
}
}