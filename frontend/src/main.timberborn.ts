import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { timberbornAppConfig } from './app/app.timberborn.config';

bootstrapApplication(App, timberbornAppConfig)
  .catch((error) => console.error(error));