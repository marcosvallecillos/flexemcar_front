import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api-service.service';

@Injectable()
export class LastLoginInterceptor implements HttpInterceptor {
    private lastUpdate: number = 0;
    private readonly INTERVALO = 5 * 60 * 1000; // 5 minutos en ms

    constructor(
        private authService: AuthService,
        private apiService: ApiService
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Evita llamadas recursivas y solo actúa si el usuario está logueado
        if (req.url.includes('last-login') || !this.authService.isLoggedIn()) {
            return next.handle(req);
        }

        const ahora = Date.now();
        const userId = this.authService.getUserId();

        // Solo actualiza si han pasado más de 5 minutos
        if (userId && (ahora - this.lastUpdate) > this.INTERVALO) {
            this.lastUpdate = ahora;
            this.apiService.updateLastLogin(userId).subscribe();
        }

        return next.handle(req);
    }
}