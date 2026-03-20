import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { LastLoginInterceptor } from './interceptors/last-login.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
     {
            provide: HTTP_INTERCEPTORS,
            useClass: LastLoginInterceptor,
            multi: true
        }
  ]
};
