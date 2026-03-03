import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './about-section.html',
  styleUrl: './about-section.css',
})
export class AboutSection {
  pills = [
    '✓ +150 inspecciones',
    '✓ Garantía 12 meses',
    '✓ Financiación en 24h',
    '✓ Entrega en toda España'
  ];
}
