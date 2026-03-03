import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
export class Reviews {
  reviews: Review[] = [
    {
      id: 1,
      stars: 5,
      text: 'Compramos dos Sprinters para nuestra empresa de mensajería. El proceso fue impecable: asesoramiento personalizado, documentación sin complicaciones y los vehículos llegaron en perfectas condiciones. Definitivamente volveremos.',
      reviewerName: 'José Martínez',
      reviewerCompany: 'CEO · MensaLogística SL',
      reviewerInitials: 'JM',
      featured: true
    },
    {
      id: 2,
      stars: 5,
      text: 'Rápido, serio y transparente. Sin letra pequeña. Mi furgoneta lleva ya 30.000 km sin ningún problema.',
      reviewerName: 'Ana López',
      reviewerCompany: 'Autónoma · Catering',
      reviewerInitials: 'AL'
    },
    {
      id: 3,
      stars: 5,
      text: 'La financiación fue aprobada en menos de 24 horas. Un servicio que no esperaba tan ágil.',
      reviewerName: 'Pedro Ruiz',
      reviewerCompany: 'Transportista autónomo',
      reviewerInitials: 'PR'
    },
    {
      id: 4,
      stars: 4,
      text: 'Muy buena atención al cliente y vehículo en excelente estado. Repetiré sin dudarlo.',
      reviewerName: 'Carlos Sánchez',
      reviewerCompany: 'Distribución alimentaria',
      reviewerInitials: 'CS'
    }
  ];

  getStars(count: number): string {
    return '★'.repeat(count) + '☆'.repeat(5 - count);
  }
}
