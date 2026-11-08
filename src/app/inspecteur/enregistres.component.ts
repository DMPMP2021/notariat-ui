import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService, Declaration } from '../core/api.service';
import { NotificationService } from '../core/notification.service';
import { EvaluationBadgeComponent } from '../shared/evaluation-badge.component';

@Component({
  selector: 'app-enregistres',
  standalone: true,
  imports: [CommonModule, FormsModule, EvaluationBadgeComponent],
  styles: [`.det { font-size: .8rem; color: var(--muted); }`],
  template: `
  <div class="toolbar"><h1>Actes enregistrés</h1>
    <input type="search" style="max-width:260px" placeholder="Rechercher (réf., n°, notaire, parties...)" [(ngModel)]="q" autocomplete="off" aria-label="Rechercher">
  </div>
  <p style="color:var(--muted);margin-top:0">Actes que vous avez enregistrés : {{ filtres.length }}. L'évaluation est celle de votre vérificateur (lecture seule).</p>
  <p class="error" *ngIf="err">{{ err }}</p>
  <div class="empty" *ngIf="!filtres.length">Aucun acte enregistré.</div>
  <div class="table-wrap" *ngIf="filtres.length"><table>
    <tr><th>N° d'enregistrement</th><th>Acte</th><th>Notaire / parties</th><th class="num">Montant déclaré (DA)</th>
        <th class="num">Ordre de versement (DA)</th><th>Évaluation du vérificateur</th><th>PDF de l'acte</th></tr>
    <tr *ngFor="let d of filtres">
      <td><strong>{{ d.numeroEnregistrement }}</strong><div class="det">{{ d.dateEnregistrement | date:'dd/MM/yyyy' }}</div></td>
      <td>{{ d.reference }}</td>
      <td>{{ d.notaire?.nomComplet }}<div class="det">{{ d.vendeurNom }} → {{ d.acheteurNom }}</div></td>
      <td class="num">{{ d.prixVente | number:'1.2-2' }}</td>
      <td class="num">{{ d.ordreVersement ? (d.ordreVersement.montant | number:'1.2-2') : '—' }}</td>
      <td><app-evaluation [ev]="d.evaluation" /></td>
      <td><button class="ghost" *ngIf="d.cheminFichier" (click)="api.voirFichier(d)">PDF de l'acte</button><span *ngIf="!d.cheminFichier">—</span></td>
    </tr>
  </table></div>`
})
export class EnregistresComponent implements OnInit, OnDestroy {
  items: Declaration[] = []; err = ''; q = '';
  private sub?: Subscription;
  constructor(public api: ApiService, private notif: NotificationService) {}
  private norm(v: unknown) { return String(v ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  get filtres() {
    const t = this.norm(this.q).trim();
    return this.items.filter(d => !t || [d.reference, d.numeroEnregistrement, d.notaire?.nomComplet, d.vendeurNom, d.acheteurNom]
      .some(c => this.norm(c).includes(t)));
  }
  ngOnInit() { this.charger(); this.sub = this.notif.incoming$.subscribe(() => this.charger()); }
  ngOnDestroy() { this.sub?.unsubscribe(); }
  charger() {
    this.api.enregistresInspecteur().subscribe({
      next: l => { this.items = l; this.err = ''; },
      error: e => this.err = e.error?.message ?? `Chargement impossible (code ${e.status}).`
    });
  }
}
