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
// import { Component, OnDestroy, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Subscription } from 'rxjs';
// import { ApiService, CONCLUSION_LABELS, Conclusion, Declaration } from '../core/api.service';
// import { NotificationService } from '../core/notification.service';
// import { EvaluationBadgeComponent } from '../shared/evaluation-badge.component';

// @Component({
//   selector: 'app-a-evaluer',
//   standalone: true,
//   imports: [CommonModule, FormsModule, EvaluationBadgeComponent],
//   styles: [`
//     select { font: inherit; padding: .5rem .6rem; border: 1px solid #aeb7c0; border-radius: 6px; background: #fff; }
//     .det { font-size: .8rem; color: var(--muted); }
//     .saisie { min-width: 190px; }
//     .saisie input + input { margin-top: .35rem; font-size: .85rem; }
//     .v-Conforme { color: var(--ok); } .v-SousEvalue { color: var(--danger); } .v-SurEvalue { color: #1f5fa8; }
//     .verdict { font-weight: 700; }
//     .ancienne { font-size: .78rem; color: var(--muted); }
//   `],
//   template: `
//   <div class="toolbar"><h1>Actes enregistrés à évaluer</h1>
//     <div class="actions">
//       <input type="search" style="max-width:240px" placeholder="Rechercher (réf., notaire, parties...)" [(ngModel)]="q" autocomplete="off" aria-label="Rechercher">
//       <select [(ngModel)]="vue" aria-label="Filtrer">
//         <option value="tous">Tous les actes</option>
//         <option value="non">À évaluer</option>
//         <option value="evalues">Déjà évalués</option>
//       </select>
//     </div>
//   </div>

//   <p class="error" *ngIf="err">{{ err }}</p>
//   <p class="error" *ngIf="charge && !inspecteurNom">Aucun inspecteur ne vous est affecté : aucun acte à afficher. Contactez l'administrateur.</p>
//   <p style="color:var(--muted);margin-top:0" *ngIf="inspecteurNom">
//     Actes enregistrés par <strong>{{ inspecteurNom }}</strong>. Ouvrez le PDF de l'acte, tapez le montant de référence :
//     il est comparé au montant déclaré par le notaire (tolérance {{ tolerance }} %).
//   </p>

//   <div class="empty" *ngIf="inspecteurNom && !filtres.length">Aucun acte.</div>
//   <div class="table-wrap" *ngIf="filtres.length"><table>
//     <tr><th>Acte enregistré</th><th>Notaire / parties</th><th class="num">Montant déclaré (DA)</th><th>PDF de l'acte</th>
//         <th>Montant de référence (DA)</th><th>Comparaison</th><th>Évaluation enregistrée</th><th></th></tr>
//     <tr *ngFor="let d of filtres">
//       <td><strong>{{ d.reference }}</strong>
//         <div class="det">N° {{ d.numeroEnregistrement }}<br>{{ d.dateEnregistrement | date:'dd/MM/yyyy' }}</div></td>
//       <td>{{ d.notaire?.nomComplet }}<div class="det">{{ d.vendeurNom }} → {{ d.acheteurNom }}</div></td>
//       <td class="num">{{ d.prixVente | number:'1.2-2' }}</td>
//       <td><button class="ghost" *ngIf="d.cheminFichier" (click)="api.voirFichier(d)">PDF de l'acte</button><span *ngIf="!d.cheminFichier">—</span></td>
//       <td class="saisie">
//         <input type="number" min="0" step="0.01" placeholder="Montant de référence"
//                [ngModel]="saisies[d.id]" (ngModelChange)="saisies[d.id] = $event" (keyup.enter)="evaluer(d)"
//                [attr.aria-label]="'Montant de référence de ' + d.reference">
//         <input type="text" maxlength="500" placeholder="Observation (facultatif)"
//                [ngModel]="observations[d.id]" (ngModelChange)="observations[d.id] = $event">
//       </td>
//       <td aria-live="polite">
//         <ng-container *ngIf="saisies[d.id] && saisies[d.id]! > 0; else attente">
//           Écart : <strong>{{ ecart(d) | number:'1.2-2' }} DA</strong> ({{ pct(d) | number:'1.0-2' }} %)<br>
//           <span class="verdict v-{{ verdict(d) }}">{{ libelle(verdict(d)) }}</span>
//         </ng-container>
//         <ng-template #attente><span class="det">Tapez le montant de référence</span></ng-template>
//       </td>
//       <td>
//         <app-evaluation [ev]="d.evaluation" />
//         <div class="ancienne" *ngIf="d.evaluation && !estEvalue(d)">Évaluation faite avant l'enregistrement</div>
//       </td>
//       <td>
//         <button [disabled]="!saisies[d.id] || saisies[d.id]! <= 0 || busyId === d.id" (click)="evaluer(d)">
//           {{ estEvalue(d) ? 'Mettre à jour' : 'Évaluer' }}</button>
//         <div class="error" *ngIf="erreurs[d.id]">{{ erreurs[d.id] }}</div>
//       </td>
//     </tr>
//   </table></div>`
// })
// export class AEvaluerComponent implements OnInit, OnDestroy {
//   items: Declaration[] = []; err = ''; charge = false; q = '';
//   inspecteurNom: string | null = null;
//   vue: 'tous' | 'non' | 'evalues' = 'tous';
//   saisies: Record<number, number | null> = {};
//   observations: Record<number, string> = {};
//   erreurs: Record<number, string> = {};
//   busyId?: number; tolerance = 5;
//   private sub?: Subscription;
//   constructor(public api: ApiService, private notif: NotificationService) {}

//   private norm(v: unknown) { return String(v ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
//   /** Évalué après l'enregistrement de l'acte. */
//   estEvalue(d: Declaration) { return !!d.evaluation && new Date(d.evaluation.dateEvaluation) >= new Date(d.dateEnregistrement ?? 0); }
//   get filtres() {
//     const t = this.norm(this.q).trim();
//     return this.items.filter(d =>
//       (this.vue === 'tous' || (this.vue === 'evalues') === this.estEvalue(d)) &&
//       (!t || [d.reference, d.numeroEnregistrement, d.notaire?.nomComplet, d.vendeurNom, d.acheteurNom].some(c => this.norm(c).includes(t))));
//   }

//   // comparaison en direct, même règle que le serveur : montant déclaré par le notaire − montant de référence
//   ecart(d: Declaration) { return Math.round((d.prixVente - (this.saisies[d.id] ?? 0)) * 100) / 100; }
//   pct(d: Declaration) { const r = this.saisies[d.id]; return r ? Math.round((this.ecart(d) * 10000) / r) / 100 : 0; }
//   verdict(d: Declaration): Conclusion { return Math.abs(this.pct(d)) <= this.tolerance ? 'Conforme' : this.ecart(d) < 0 ? 'SousEvalue' : 'SurEvalue'; }
//   libelle(c: Conclusion) { return CONCLUSION_LABELS[c]; }

//   ngOnInit() {
//     this.api.tolerance().subscribe({ next: t => this.tolerance = t.tolerancePourcent, error: () => {} });
//     this.charger();
//     this.sub = this.notif.incoming$.subscribe(() => this.charger());
//   }
//   ngOnDestroy() { this.sub?.unsubscribe(); }
//   charger() {
//     this.api.enregistresAEvaluer().subscribe({
//       next: r => {
//         this.items = r.actes; this.inspecteurNom = r.inspecteurNom; this.charge = true; this.err = '';
//         for (const d of r.actes)   // pré-remplit la saisie avec l'évaluation déjà enregistrée
//           if (d.evaluation && this.saisies[d.id] === undefined) {
//             this.saisies[d.id] = d.evaluation.montantReference;
//             this.observations[d.id] = d.evaluation.observation ?? '';
//           }
//       },
//       error: e => { this.charge = true; this.err = e.error?.message ?? `Chargement impossible (code ${e.status}).`; }
//     });
//   }
//   evaluer(d: Declaration) {
//     const ref = this.saisies[d.id];
//     if (!ref || ref <= 0) return;
//     this.busyId = d.id; this.erreurs[d.id] = '';
//     this.api.reevaluer(d.id, ref, (this.observations[d.id] ?? '').trim()).subscribe({
//       next: () => { this.busyId = undefined; this.charger(); },
//       error: e => { this.busyId = undefined; this.erreurs[d.id] = e.error?.message ?? 'Évaluation impossible.'; }
//     });
//   }
// }
