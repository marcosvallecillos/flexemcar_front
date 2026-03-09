import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-hero',
  imports: [RouterModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  isSpanish: boolean = true;
  scrollToStats() {
    const statsSection = document.getElementById('hero-stats');
    if (statsSection) {
      statsSection.scrollIntoView({ 
        behavior: 'smooth', 
        inline: 'start',
        block: 'center' 
      });
    }
  }
  constructor(private languageService: LanguageService) {
      this.languageService.isSpanish$.subscribe(
        isSpanish => this.isSpanish = isSpanish
      );
    }
  
    getText(es: string, en: string): string {
      return this.isSpanish ? es : en;
    }
  
}
