import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { routes } from './app.routes';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // Build time only: the router is how the prerenderer finds the pages to
    // render. The browser never needs it (App reads the language off the URL),
    // and there it would rewrite "/ar/" to "/ar" in the address bar.
    provideRouter(routes),
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
