import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, Declaration } from '../core/api.service';
import { NotificationService } from '../core/notification.service';
import { StatutBadgeComponent } from '../shared/statut-badge.component';

@Component({
  selector: 'app-mes-declarations',
  standalone: true,
  imports: [CommonModule, RouterLink, StatutBadgeComponent],
  template: `
  <div class="toolbar"><h1>Mes déclarations</h1><a class="btn" routerLink="/notaire/declarations/nouvelle">Nouvelle déclaration</a></div>
  <p class="error" *ngIf="err">{{ err }}</p>
  <div class="empty" *ngIf="!items.length">Aucune déclaration. Créez votre premier acte de vente.</div>
  <div class="table-wrap" *ngIf="items.length"><table>
    <tr><th>Référence</th><th>Vendeur → Acheteur</th><th class="num">Montant acte (DA)</th><th class="num">Droits + pénalité (DA)</th><th>Statut</th><th>N° enregistrement</th><th></th></tr>
    <tr *ngFor="let d of items">
      <td>{{ d.reference }}</td>
      <td>{{ d.vendeurNom }} → {{ d.acheteurNom }}</td>
      <td class="num">{{ d.prixVente | number:'1.2-2' }}</td>
      <td class="num">{{ d.codeQ ? (d.prix + d.penalite | number:'1.2-2') : '—' }}</td>
      <td><app-statut [s]="d.statut" /><div class="motif" *ngIf="d.motifRejet">Motif : {{ d.motifRejet }}</div></td>
      <td>{{ d.numeroEnregistrement || '—' }}</td>
      <td class="actions">
        <a class="btn ghost" *ngIf="d.statut==='Brouillon' || d.statut==='Rejetee'" [routerLink]="['/notaire/declarations', d.id]">Modifier</a>
        <button *ngIf="d.statut==='Brouillon' || d.statut==='Rejetee'" (click)="soumettre(d)">Envoyer à l'inspecteur</button>
      </td>
    </tr>
  </table></div>`
})
export class MesDeclarationsComponent implements OnInit {
  items: Declaration[] = []; err = '';
  constructor(private api: ApiService, private notif: NotificationService) {}
  ngOnInit() { this.charger(); this.notif.incoming$.subscribe(() => this.charger()); }
  charger() { this.api.mes().subscribe(l => this.items = l); }
  soumettre(d: Declaration) {
    this.err = '';
    this.api.soumettre(d.id).subscribe({ next: () => this.charger(), error: e => this.err = e.error?.message ?? 'Erreur.' });
  }
}
