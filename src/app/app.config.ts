import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    { 
      provide: DATE_PIPE_DEFAULT_OPTIONS, 
      useValue: { timezone: 'Asia/Karachi' } 
    },
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    )
  ]
};
