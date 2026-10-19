import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CONCLUSION_LABELS, Evaluation } from '../core/api.service';

/** Résultat de l'évaluation du vérificateur : pastille + montant de référence et écart. */
@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .c-Conforme { color: var(--ok); } .c-SousEvalue { color: var(--danger); } .c-SurEvalue { color: #1f5fa8; }
    .none { color: var(--muted); }
    .det { font-size: .8rem; color: var(--muted); margin-top: .15rem; }
  `],
  template: `
  <ng-container *ngIf="ev; else non">
    <span class="badge c-{{ ev.conclusion }}">{{ label(ev) }}</span>
    <div class="det">Référence : {{ ev.montantReference | number:'1.2-2' }} DA<br>
      Écart : {{ ev.ecart | number:'1.2-2' }} DA ({{ ev.ecartPourcent | number:'1.0-2' }} %)</div>
    <div class="det" *ngIf="ev.observation">« {{ ev.observation }} »</div>
  </ng-container>
  <ng-template #non><span class="badge none">Non évalué</span></ng-template>`
})
export class EvaluationBadgeComponent {
  @Input() ev?: Evaluation | null;
  label(e: Evaluation) { return CONCLUSION_LABELS[e.conclusion] ?? e.conclusion; }
}