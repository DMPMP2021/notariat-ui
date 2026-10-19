import { RecherchePipe } from '../core/search.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Ordre } from '../core/api.service';
import { NotificationService } from '../core/notification.service';

@Component({
  selector: 'app-ordres',
  standalone: true,
  imports: [RecherchePipe, CommonModule, FormsModule],
  template: `
  <div class="toolbar"><h1>Ordres de versement à encaisser</h1>
    <input style="max-width:260px" placeholder="Rechercher un n° d'ordre" [(ngModel)]="q" aria-label="Rechercher un ordre"></div>
  <p class="error" *ngIf="err">{{ err }}</p>
  <p *ngIf="quittance" style="color:var(--ok)">Paiement validé. Quittance <strong>{{ quittance.num }}</strong>
    <button class="ghost" style="margin-left:.6rem" (click)="api.quittancePdf(quittance.ordreId, quittance.num)">Télécharger la quittance</button></p>
  <div class="empty" *ngIf="!filtres.length">Aucun ordre de versement en attente.</div>
  <div class="table-wrap" *ngIf="filtres.length"><table>
    <tr><th>N° ordre</th><th>Acte</th><th>Notaire</th><th class="num">Montant (DA)</th><th></th></tr>
    <tr *ngFor="let o of filtres | recherche">
      <td>{{ o.numero }}</td><td>{{ o.declaration.reference }}</td><td>{{ o.declaration.notaire?.nomComplet }}</td>
      <td class="num">{{ o.montant | number:'1.2-2' }}</td>
      <td><button (click)="payer(o)">Encaisser et délivrer la quittance</button></td>
    </tr>
  </table></div>`
})
export class OrdresComponent implements OnInit {
  items: Ordre[] = []; q = ''; err = ''; quittance?: { num: string; ordreId: number };
  constructor(public api: ApiService, private notif: NotificationService) {}
  get filtres() { return this.items.filter(o => o.numero.toLowerCase().includes(this.q.trim().toLowerCase())); }
  ngOnInit() { this.charger(); this.notif.incoming$.subscribe(() => this.charger()); }
  charger() { this.api.ordresAPayer().subscribe(l => this.items = l); }
  payer(o: Ordre) {
    if (!confirm(`Confirmer l'encaissement de ${o.montant} DA pour ${o.numero} ?`)) return;
    this.err = '';
    this.api.payer(o.id).subscribe({
      next: r => { this.quittance = { num: r.numeroQuittance, ordreId: o.id }; this.charger(); },
      error: e => this.err = e.error?.message ?? 'Erreur.'
    });
  }
}
