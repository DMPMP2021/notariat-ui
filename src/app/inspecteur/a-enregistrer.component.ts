import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Declaration } from '../core/api.service';
import { NotificationService } from '../core/notification.service';

@Component({
  selector: 'app-a-enregistrer',
  standalone: true,
  imports: [CommonModule],
  template: `
  <h1>Actes payés à enregistrer</h1>
  <p class="error" *ngIf="err">{{ err }}</p>
  <p *ngIf="dernier" style="color:var(--ok)">Acte enregistré sous le n° <strong>{{ dernier }}</strong>.</p>
  <div class="empty" *ngIf="!items.length">Aucun acte payé en attente d'enregistrement.</div>
  <div class="table-wrap" *ngIf="items.length"><table>
    <tr><th>Référence</th><th>Notaire</th><th>Vendeur → Acheteur</th><th>N° ordre</th><th class="num">Montant payé (DA)</th><th>Quittance</th><th></th></tr>
    <tr *ngFor="let d of items">
      <td>{{ d.reference }}</td><td>{{ d.notaire?.nomComplet }}</td>
      <td>{{ d.vendeurNom }} → {{ d.acheteurNom }}</td><td>{{ d.ordreVersement?.numero }}</td>
      <td class="num">{{ d.ordreVersement?.montant | number:'1.2-2' }}</td>
      <td>{{ d.ordreVersement?.paiement?.numeroQuittance }}
        <button class="ghost" (click)="api.telechargerQuittance(d.ordreVersement!.id, d.ordreVersement?.paiement?.numeroQuittance ?? d.reference, !!d.ordreVersement?.paiement?.fichierQuittance)">Voir</button></td>
      <td><button (click)="enregistrer(d)">Enregistrer l'acte</button></td>
    </tr>
  </table></div>`
})
export class AEnregistrerComponent implements OnInit {
  items: Declaration[] = []; err = ''; dernier = '';
  constructor(public api: ApiService, private notif: NotificationService) {}
  ngOnInit() { this.charger(); this.notif.incoming$.subscribe(() => this.charger()); }
  charger() { this.api.aEnregistrer().subscribe(l => this.items = l); }
  enregistrer(d: Declaration) {
    this.err = '';
    this.api.enregistrer(d.id).subscribe({
      next: r => { this.dernier = r.numeroEnregistrement; this.charger(); },
      error: e => this.err = e.error?.message ?? 'Erreur.'
    });
  }
}
