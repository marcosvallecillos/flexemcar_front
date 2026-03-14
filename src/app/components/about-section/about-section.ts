import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './about-section.html',
  styleUrl: './about-section.css',
})
export class AboutSection {
  get pills(): string[] {
  return [
    this.getText('✓ +150 inspecciones','✓ +150 inspections'),
    this.getText('✓ Garantía 12 meses','✓ 12-month warranty'),
    this.getText('✓ Financiación en 24h','✓ Financing in 24h'),
    this.getText('✓ Entrega en toda España','✓ Delivery throughout Spain')
  ];
}

  isSpanish:boolean = true;
   constructor(private languageService: LanguageService) {
        this.languageService.isSpanish$.subscribe(
          isSpanish => this.isSpanish = isSpanish
        );
      }
    
      getText(es: string, en: string): string {
        return this.isSpanish ? es : en;
      }

}
