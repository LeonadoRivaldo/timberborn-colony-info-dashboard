import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import type { AutomationDocument } from '../../../../core/models/automation.model';
import type { StoredDocument } from '../../../../core/models/stored-document.model';

@Component({
  selector: 'app-levers-panel',
  imports: [TranslatePipe],
  templateUrl: './levers-panel.html',
  styleUrl: './levers-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeversPanel {
  readonly levers = input<StoredDocument<AutomationDocument>[]>([]);
  readonly loading = input(false);
  readonly error = input('');
  readonly saving = input<ReadonlySet<string>>(new Set());
  readonly writeError = input('');
  readonly toggle = output<{ id: string; state: boolean }>();
  readonly search = signal('');
  readonly visibleLevers = computed(() => {
    const term = this.search().trim().toLocaleLowerCase();
    return this.levers().filter((lever) =>
      String(lever.data.name ?? lever.id).toLocaleLowerCase().includes(term),
    );
  });
  readonly activeCount = computed(() => this.levers().filter((lever) => lever.data.state === true).length);

  displayName(name: string): string {
    return name.replace(/_/g, ' ').toLocaleLowerCase();
  }
}