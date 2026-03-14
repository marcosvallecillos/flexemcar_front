import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent implements OnInit, OnDestroy {

  isOpen = false;
  isSpanish = true;
  private langSub!: Subscription;

  // 👇 Pon aquí el número de tu chatbot de WhatsApp (con prefijo internacional, sin + ni espacios)
  private readonly WHATSAPP_NUMBER = '34600000000';
  private readonly WHATSAPP_MESSAGE_ES = 'Hola, estoy interesado en una furgoneta de ocasión. ¿Pueden ayudarme?';
  private readonly WHATSAPP_MESSAGE_EN = 'Hello, I am interested in a used van. Can you help me?';

  get whatsappUrl(): string {
    const msg = encodeURIComponent(
      this.isSpanish ? this.WHATSAPP_MESSAGE_ES : this.WHATSAPP_MESSAGE_EN
    );
    return `https://wa.me/${this.WHATSAPP_NUMBER}?text=${msg}`;
  }

  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    this.langSub = this.languageService.isSpanish$.subscribe(val => {
      this.isSpanish = val;
    });
  }

  ngOnDestroy() {
    this.langSub.unsubscribe();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  getText(es: string, en: string): string {
    return this.isSpanish ? es : en;
  }
}