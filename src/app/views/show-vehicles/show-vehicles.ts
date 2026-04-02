import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { ApiService } from '../../services/api-service.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserStateService } from '../../services/user-state.service';
import { Footer } from '../../components/footer/footer';
import { Catalogo } from '../../models/user.interface';
import { DecimalPipe, NgClass, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-show-vehicles',
  imports: [Footer, NgClass, DecimalPipe, UpperCasePipe,FormsModule],
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

  minPrice: number | null = null;
  maxPrice: number | null = null;
  minKm: number | null = null;
  maxKm: number | null = null;
  priceFilterError: string | null = null;
  kmFilterError: string | null = null;
  marcas: string[] = [];
  selectedMarca: string = 'Todas';
  selectedKm: string = 'Todos';
  selectedPrice: string = 'Todos';
  messageNoUser: string = '';
  messageNoUserDisplay: string | null = null;
  priceRanges = [
    { label: '< 25.000 €', key: 'lt25' },
    { label: '25.000 - 35.000 €', key: '25to35' },
    { label: '> 35.000 €', key: 'gt35' },
  ];
  kmRanges = [
    { label: '< 50.000 km', key: 'lt50' },
    { label: '100.000 - 200.000 km', key: '100to200' },
    { label: '> 200.000 km', key: 'gt200' },
    ]; 

  constructor(
    private languageService: LanguageService,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private userStateService: UserStateService,
    private cdr: ChangeDetectorRef,
  ) {
    this.languageService.isSpanish$.subscribe(i => this.isSpanish = i);

    this.userStateService.isUser$.subscribe(isUser => {
      this.isUser = isUser;
      setTimeout(() => this.cdr.detectChanges(), 0);
    });
  }

  ngOnInit() {
    this.isUser = this.userStateService.getIsUser();

    this.isLoading = true;
    this.cdr.detectChanges();

    this.apiService.getAllVehiculos().subscribe({
      next: (data: Catalogo[]) => {
        this.vehicles = data;
        this.marcas = [...new Set(data.map(v => v.marca))];

        // Read query params from hero search bar and apply filters
        this.route.queryParams.subscribe(params => {
          const marca = params['marca'] || '';
          const modelo = params['modelo'] || '';
          const precioMin = params['precioMin'] ? +params['precioMin'] : 0;
          const precioMax = params['precioMax'] ? +params['precioMax'] : 0;

          if (marca || modelo || precioMin || precioMax) {
            // Set sidebar filter state to reflect the search
            if (marca) this.selectedMarca = marca;
            if (precioMin) this.minPrice = precioMin;
            if (precioMax) this.maxPrice = precioMax;

            // Filter locally
            let result = [...this.vehicles];

            if (marca) {
              result = result.filter(v => v.marca === marca);
            }
            if (modelo) {
              result = result.filter(v => v.modelo === modelo);
            }
            if (precioMin) {
              result = result.filter(v => parseFloat(v.precio) >= precioMin);
            }
            if (precioMax) {
              result = result.filter(v => parseFloat(v.precio) <= precioMax);
            }

            this.filteredVehicles = result;
          } else {
            this.filteredVehicles = [...this.vehicles];
          }

          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Error:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
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


  applyFilters() {
    let result = [...this.vehicles];
    
    if (this.selectedMarca !== 'Todas') {
      result = result.filter(v => v.marca === this.selectedMarca);
    }
    
    // Filtro local de kilometraje (por si usaste el buscador de precios, esto intersecta)
    if (this.minKm !== null || this.maxKm !== null) {
      result = result.filter(v => {
        const km = parseFloat(v.km);
        const minK = this.minKm !== null ? this.minKm : 0;
        const maxK = this.maxKm !== null ? this.maxKm : Infinity;
        return km >= minK && km <= maxK;
      });
    }

    // Filtro local de precio (por si usaste el buscador de KM, esto intersecta)
    if (this.minPrice !== null || this.maxPrice !== null) {
      result = result.filter(v => {
        const price = parseFloat(v.precio);
        const minP = this.minPrice !== null ? this.minPrice : 0;
        const maxP = this.maxPrice !== null ? this.maxPrice : Infinity;
        return price >= minP && price <= maxP;
      });
    }

    this.filteredVehicles = result;
  }

  filterByPrice() {
    if (this.minPrice === null && this.maxPrice === null) {
      this.priceFilterError = this.getText(
        'Debe proporcionar al menos un precio (mínimo o máximo)',
        'You must provide at least one price (minimum or maximum)'
      );
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();
    this.apiService.filterByPrice(this.minPrice || undefined, this.maxPrice || undefined).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.vehicles = response.vehicles || [];
          this.applyFilters(); // Re-apply other local filters (marca, km) over the new base list
          this.priceFilterError = null;
        } else {
          this.priceFilterError = this.getText(
            'Error al filtrar por precio',
            'Error filtering by price'
          );
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error filtering by price:', error);
        this.priceFilterError = this.getText(
          'Error al filtrar por precio',
          'Error filtering by price'
        );
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  clearPriceFilter() {
    this.minPrice = null;
    this.maxPrice = null;
    this.priceFilterError = null;
    this.getAllVehicles();
  }

  filterByKm() {
    if (this.minKm === null && this.maxKm === null) {
      this.kmFilterError = this.getText(
        'Debe proporcionar al menos un kilometraje (mínimo o máximo)',
        'You must provide at least one kilometers (minimum or maximum)'
      );
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.apiService.filterByKm(this.minKm || undefined, this.maxKm || undefined).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.vehicles = response.vehicles || [];
          this.applyFilters(); // Re-apply local filters
          this.kmFilterError = null;
        } else {
          this.kmFilterError = this.getText(
            'Error al filtrar por kilometraje',
            'Error filtering by kilometers'
          );
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error filtering by km:', error);
        this.kmFilterError = this.getText(
          'Error al filtrar por kilometraje',
          'Error filtering by kilometers'
        );
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
  clearKmFilter() {
    this.minKm = null;
    this.maxKm = null;
    this.kmFilterError = null;
    this.getAllVehicles();
  }
  verDetalles(id: number) {
    this.router.navigate(['/vehicles', id]);
  }

  reservarCita(vehicle: Catalogo) {
    if (!this.isUser) {
      this.messageNoUserDisplay = this.getText('Deberás iniciar sesión para realizar esta función', 'You must log in to do this function.');
      setTimeout(() => {
        this.messageNoUserDisplay = null;
      }, 2000);
      return;
    }
    console.log('Vehicle seleccionado:', vehicle); // debug: verifica que vehicle.id llega
    const modelo = `${vehicle.marca} ${vehicle.modelo}`;
    const imagenes = vehicle.image_url && vehicle.image_url.length > 0
      ? vehicle.image_url.join(',')
      : '/images/hero_image.png';
     this.router.navigate(['/new-reserve', vehicle.id]);

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