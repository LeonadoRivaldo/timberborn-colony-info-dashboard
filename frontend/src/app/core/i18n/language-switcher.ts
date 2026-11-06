import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LanguageService } from './language.service';

@Component({
  selector: 'app-language-switcher',
  template: `
    <label class="language-switcher">
      <span class="visually-hidden">{{ languages.text('language.label') }}</span>
      <select [value]="languages.currentLanguage()" [attr.aria-label]="languages.text('language.label')" (change)="languages.setLanguage($any($event.target).value)">
        <option value="en">English</option>
        <option value="pt-BR">Português (Brasil)</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
      </select>
    </label>
  `,
  styles: `
    :host { display: inline-flex; }
    .language-switcher select { min-height: 34px; max-width: 154px; border: 1px solid #53684f; border-radius: 4px; padding: 0 8px; background: #17241d; color: #e4e9dc; font: 11px 'IBM Plex Mono', monospace; }
    .language-switcher select:focus-visible { outline: 2px solid #9acb87; outline-offset: 2px; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcher {
  readonly languages = inject(LanguageService);
}