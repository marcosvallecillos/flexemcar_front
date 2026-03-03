import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero',
  imports: [RouterModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
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
}
