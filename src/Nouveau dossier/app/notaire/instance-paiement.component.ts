import { RecherchePipe } from '../core/search.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Declaration, DetailQ } from '../core/api.service';
import { NotificationService } from '../core/notification.service';
import { PrintOvService } from '../core/print-ov.service';

@Component({
  selector: 'app-instance-paiement',
  standalone: true,
  imports: [RecherchePipe, CommonModule],
  template: `
  <h1>Actes validés : instance de paiement</h1>
  <p style="color:var(--muted)">Imprimez l'ordre de versement et présentez-le au Receveur pour le paiement.</p>
  <div class="empty" *ngIf="!items.length">Aucun acte en attente de paiement.</div>
  <div class="table-wrap" *ngIf="items.length"><table>
    <tr><th>Acte</th><th>Parties</th><th>N° ordre</th><th class="num">Droits</th><th class="num">Pénalité</th><th class="num">Total (DA)</th><th></th></tr>
    <tr *ngFor="let d of items | recherche">
      <td>{{ d.reference }}</td>
      <td>{{ d.vendeurNom }} → {{ d.acheteurNom }}</td>
      <td>{{ d.ordreVersement?.numero }}</td>
      <td class="num">{{ d.prix | number:'1.2-2' }}</td>
      <td class="num">{{ d.penalite | number:'1.2-2' }}</td>
      <td class="num">{{ d.ordreVersement?.montant | number:'1.2-2' }}</td>
      <td class="actions">
        <button (click)="imprimer(d, 'fr')">Imprimer (FR)</button>
        <button (click)="imprimer(d, 'ar')">طباعة (AR)</button>
        <button class="ghost" (click)="api.ordrePdf(d)">PDF simple</button>
      </td>
    </tr>
  </table></div>
  <h2 style="margin-top:2rem" *ngIf="payes.length">Payés, en attente d'enregistrement</h2>
  <div class="table-wrap" *ngIf="payes.length"><table>
    <tr><th>Acte</th><th>N° ordre</th><th></th></tr>
    <tr *ngFor="let d of payes | recherche"><td>{{ d.reference }}</td><td>{{ d.ordreVersement?.numero }}</td>
      <td><button class="ghost" (click)="api.quittancePdf(d.ordreVersement!.id, 'quittance-' + d.reference)">Télécharger la quittance</button></td></tr>
  </table></div>`
})
export class InstancePaiementComponent implements OnInit {
  items: Declaration[] = []; payes: Declaration[] = []; details: DetailQ[] = [];
  constructor(public api: ApiService, private notif: NotificationService, private print: PrintOvService) {}
  ngOnInit() {
    this.api.details().subscribe(l => this.details = l);
    this.charger();
    this.notif.incoming$.subscribe(() => this.charger());
  }
  charger() {
    this.api.mes('InstancePaiement').subscribe(l => this.items = l);
    this.api.mes('Payee').subscribe(l => this.payes = l);
  }
  imprimer(d: Declaration, lang: 'fr' | 'ar') {
    const q = this.details.find(x => x.codeQ === d.codeQ);
    this.print.imprimer(d, lang, q?.libelleQFr ?? '', q?.libelleQAr ?? '');
  }
}
