import { Component, Input } from '@angular/core';
import { STATUT_LABELS, Statut } from '../core/api.service';

@Component({
  selector: 'app-statut',
  standalone: true,
  template: `<span class="badge s-{{ s }}">{{ label }}</span>`
})
export class StatutBadgeComponent {
  @Input() s!: Statut;
  get label() { return STATUT_LABELS[this.s] ?? this.s; }
}
