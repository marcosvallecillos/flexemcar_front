import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { REACTIVE_NODE } from '@angular/core/primitives/signals';
import { LanguageService } from '../../services/language.service';

interface Vehicle {
  id: number;
  name: string;
  year: number;
  km: string;
  fuel: string;
  price: string;
  badge: string;
  badgeType: 'certified' | 'offer';
  image: string;
}

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, RouterModule,RouterLink],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.css',
})
export class Vehicles {
 get vehicles(): Vehicle[]  { 
    return [
    {
      id: 1,
      name: 'Mercedes-Benz Sprinter 314',
      year: 2021,
      km: '89.000 km',
      fuel: 'Diésel',
      price: '28.500€',
      badge: 'CERTIFICADO',
      badgeType: 'certified',
      image: '/images/hero_image.png'
    },
    {
      id: 2,
      name: 'Volkswagen Crafter 35',
      year: 2020,
      km: '112.000 km',
      fuel: 'Diésel',
      price: '22.900€',
      badge: 'OFERTA',
      badgeType: 'offer',
      image: '/images/hero_image.png'
    },
    {
      id: 3,
      name: 'Ford Transit Custom L2',
      year: 2022,
      km: '67.000 km',
      fuel: 'Diésel',
      price: '31.200€',
      badge: 'CERTIFICADO',
      badgeType: 'certified',
      image: '/images/hero_image.png'
    }
  ];
}

isSpanish: boolean = true;
constructor(private languageService: LanguageService) {
      this.languageService.isSpanish$.subscribe(
        isSpanish => this.isSpanish = isSpanish
      );
    }
  
    getText(es: string, en: string): string {
      return this.isSpanish ? es : en;
    }
}
