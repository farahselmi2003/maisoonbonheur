import { ApplicationConfig, provideZoneChangeDetection, ErrorHandler } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AppErrorHandler } from './core/app-error-handler';
import { provideHttpClient } from '@angular/common/http';



import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    { provide: ErrorHandler, useClass: AppErrorHandler }
  ]
};
