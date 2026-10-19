import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService, CONCLUSION_LABELS, Conclusion, Declaration } from '../core/api.service';
import { NotificationService } from '../core/notification.service';
import { EvaluationBadgeComponent } from '../shared/evaluation-badge.component';




@Component({
  selector: 'app-a-evaluer',
  standalone: true,
  imports: [CommonModule, FormsModule, EvaluationBadgeComponent],
  styles: [`
    .wide { width: min(560px, 100%); }
    .cmp { background: #eef6f3; margin-bottom: 1rem; }
    .cmp table { border: none; background: transparent; }
    .cmp td { border: none; padding: .2rem 0; }
    .verdict { font-weight: 700; }
    .v-Conforme { color: var(--ok); } .v-SousEvalue { color: var(--danger); } .v-SurEvalue { color: #1f5fa8; }
    select { font: inherit; padding: .5rem .6rem; border: 1px solid #aeb7c0; border-radius: 6px; background: #fff; }
  `],
  template: `
  <div class="toolbar"><h1>Dossiers à évaluer</h1>
    <div class="actions">
      <select [(ngModel)]="vue" aria-label="Filtrer">
        <option value="tous">Tous les dossiers</option>
        <option value="non">À évaluer</option>
        <option value="evalues">Déjà évalués</option>
      </select>
    </div>
  </div>
  <p style="color:var(--muted);margin-top:0">Saisissez le montant de référence : il est comparé au montant déclaré par le notaire.
    Tolérance : {{ tolerance }} %.</p>
  <p class="error" *ngIf="err">{{ err }}</p>
  <div class="empty" *ngIf="!filtres.length">Aucun dossier.</div>
  <div class="table-wrap" *ngIf="filtres.length"><table>
    <tr><th>Référence</th><th>Notaire</th><th>Vendeur → Acheteur</th><th>Bien</th><th class="num">Montant déclaré (DA)</th><th>Évaluation</th><th>Acte</th><th></th></tr>
    <tr *ngFor="let d of filtres">
      <td>{{ d.reference }}</td><td>{{ d.notaire?.nomComplet }}</td>
      <td>{{ d.vendeurNom }} → {{ d.acheteurNom }}</td><td>{{ d.designationBien }}</td>
      <td class="num">{{ d.prixVente | number:'1.2-2' }}</td>
      <td><app-evaluation [ev]="d.evaluation" /></td>
      <td><button class="ghost" *ngIf="d.cheminFichier" (click)="api.fichier(d)">Voir l'acte</button><span *ngIf="!d.cheminFichier">—</span></td>
      <td><button (click)="ouvrir(d)">{{ d.evaluation ? 'Réévaluer' : 'Évaluer' }}</button></td>
    </tr>
  </table></div>

  <div class="modal-bg" *ngIf="cible" (click)="cible = undefined">
    <div class="card modal wide" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
      <h2>Évaluer {{ cible.reference }}</h2>
      <p style="margin-top:0;color:var(--muted)">{{ cible.designationBien }}</p>
      <div class="field"><label for="ref">Montant de référence (DA)</label>
        <input id="ref" type="number" min="0" step="0.01" [(ngModel)]="reference" (keyup.enter)="enregistrer()" autocomplete="off"></div>
      <div class="field"><label for="obs">Observation (facultatif)</label>
        <textarea id="obs" rows="2" [(ngModel)]="observation" maxlength="500"></textarea></div>

      <div class="card cmp" aria-live="polite">
        <table>
          <tr><td>Montant déclaré par le notaire</td><td class="num"><strong>{{ cible.prixVente | number:'1.2-2' }} DA</strong></td></tr>
          <tr><td>Montant de référence</td><td class="num"><strong>{{ (reference || 0) | number:'1.2-2' }} DA</strong></td></tr>
          <ng-container *ngIf="reference && reference > 0">
            <tr><td>Écart (déclaré − référence)</td><td class="num"><strong>{{ ecart | number:'1.2-2' }} DA ({{ pct | number:'1.0-2' }} %)</strong></td></tr>
            <tr><td>Résultat</td><td class="num verdict v-{{ verdict }}">{{ libelle(verdict) }}</td></tr>
          </ng-container>
        </table>
      </div>
      <p class="error" *ngIf="errModal">{{ errModal }}</p>
      <div class="actions">
        <button [disabled]="!reference || reference <= 0 || busy" (click)="enregistrer()">Enregistrer l'évaluation</button>
        <button class="ghost" (click)="cible = undefined">Annuler</button>
      </div>
    </div>
  </div>`
})
export class AEvaluerComponent implements OnInit, OnDestroy {
  items: Declaration[] = []; err = ''; errModal = ''; busy = false;
  vue: 'tous' | 'non' | 'evalues' = 'tous';
  cible?: Declaration; reference: number | null = null; observation = '';
  tolerance = 5;
  private sub?: Subscription;
  constructor(public api: ApiService, private notif: NotificationService) {}

  get filtres() {
    return this.items.filter(d => this.vue === 'tous' || (this.vue === 'non' ? !d.evaluation : !!d.evaluation));
  }
  // comparaison en direct (même règle que le serveur)
  get ecart() { return Math.round(((this.cible?.prixVente ?? 0) - (this.reference ?? 0)) * 100) / 100; }
  get pct() { return this.reference ? Math.round((this.ecart * 10000) / this.reference) / 100 : 0; }
  get verdict(): Conclusion { return Math.abs(this.pct) <= this.tolerance ? 'Conforme' : this.ecart < 0 ? 'SousEvalue' : 'SurEvalue'; }
  libelle(c: Conclusion) { return CONCLUSION_LABELS[c]; }

  ngOnInit() {
    this.api.tolerance().subscribe(t => this.tolerance = t.tolerancePourcent);
    this.charger();
    this.sub = this.notif.incoming$.subscribe(() => this.charger());
  }
  ngOnDestroy() { this.sub?.unsubscribe(); }
  charger() {
    this.api.aEvaluer().subscribe({
      next: l => { this.items = l; this.err = ''; },
      error: e => this.err = e.error?.message ?? `Chargement impossible (code ${e.status}).`
    });
  }
  ouvrir(d: Declaration) {
    this.cible = d; this.errModal = '';
    this.reference = d.evaluation?.montantReference ?? null;
    this.observation = d.evaluation?.observation ?? '';
  }
  enregistrer() {
    if (!this.cible || !this.reference || this.reference <= 0) return;
    this.busy = true; this.errModal = '';
    this.api.evaluer(this.cible.id, this.reference, this.observation.trim()).subscribe({
      next: () => { this.busy = false; this.cible = undefined; this.err = ''; this.charger(); },
      error: e => { this.busy = false; this.errModal = e.error?.message ?? 'Évaluation impossible.'; }
    });
  }
}
