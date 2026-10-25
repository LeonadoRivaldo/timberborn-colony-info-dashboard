import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { GOOD_IMAGE_IDS } from '../models/good-icon-catalog';

@Component({
  selector: 'app-good-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (image(); as source) {
      <img [src]="source" alt="" width="24" height="24" loading="lazy" (error)="failedImageId.set(goodId())" />
    } @else {
      <i class="fa-solid {{ fallbackIcon() }}" aria-hidden="true"></i>
    }
  `,
  styles: `
    :host { display: inline-flex; flex: 0 0 var(--good-icon-size, 24px); width: var(--good-icon-size, 24px); height: var(--good-icon-size, 24px); align-items: center; justify-content: center; color: var(--good-color, currentColor); }
    img { width: 100%; height: 100%; object-fit: contain; }
    i { font-size: 16px; }
  `,
})
export class GoodIcon {
  readonly goodId = input.required<string>();
  readonly fallbackIcon = input('fa-cube');
  readonly imagePath = input('');
  readonly failedImageId = signal('');
  readonly image = computed(() => {
    if (this.failedImageId() === this.goodId()) return null;
    return this.imagePath() || (GOOD_IMAGE_IDS.has(this.goodId()) ? `goods/${this.goodId()}.png` : null);
  });
}