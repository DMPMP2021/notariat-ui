import { RecherchePipe } from '../core/search.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Declaration } from '../core/api.service';
import { NotificationService } from '../core/notification.service';

@Component({
  selector: 'app-a-verifier',
  standalone: true,
  imports: [RecherchePipe, CommonModule, FormsModule],
  template: `
  <h1>Déclarations à vérifier</h1>
  <p class="error" *ngIf="err">{{ err }}</p>
  <div class="empty" *ngIf="!items.length">Aucune déclaration en attente.</div>
  <div class="table-wrap" *ngIf="items.length"><table>
    <tr><th>Référence</th><th>Notaire</th><th>Vendeur → Acheteur</th><th>Bien</th><th class="num">Montant (DA)</th><th class="num">Droits (DA)</th><th class="num">Pénalité (DA)</th><th>Date acte</th><th>Fichier</th><th></th></tr>
    <tr *ngFor="let d of items | recherche">
      <td>{{ d.reference }}</td><td>{{ d.notaire?.nomComplet }}</td>
      <td>{{ d.vendeurNom }} → {{ d.acheteurNom }}</td><td>{{ d.designationBien }}</td>
      <td class="num">{{ d.prixVente | number:'1.2-2' }}</td><td class="num">{{ d.prix | number:'1.2-2' }}</td><td class="num">{{ d.penalite | number:'1.2-2' }}</td><td>{{ d.dateActe | date:'dd/MM/yyyy' }}</td>
      <td><button class="ghost" *ngIf="d.cheminFichier" (click)="api.fichier(d)">Voir l'acte</button><span *ngIf="!d.cheminFichier">—</span></td>
      <td class="actions"><button (click)="valider(d)">Valider</button><button class="danger" (click)="cible = d; motif = ''">Rejeter</button></td>
    </tr>
  </table></div>

  <div class="modal-bg" *ngIf="cible" (click)="cible = undefined">
    <div class="card modal" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
      <h2>Rejeter {{ cible.reference }}</h2>
      <div class="field"><label for="m">Motif du rejet (obligatoire)</label><textarea id="m" rows="4" [(ngModel)]="motif"></textarea></div>
      <div class="actions">
        <button class="danger" [disabled]="!motif.trim()" (click)="rejeter()">Confirmer le rejet</button>
        <button class="ghost" (click)="cible = undefined">Annuler</button>
      </div>
    </div>
  </div>`
})
export class AVerifierComponent implements OnInit {
  items: Declaration[] = []; err = ''; cible?: Declaration; motif = '';
  constructor(public api: ApiService, private notif: NotificationService) {}
  ngOnInit() { this.charger(); this.notif.incoming$.subscribe(() => this.charger()); }
  charger() { this.api.aVerifier().subscribe(l => this.items = l); }
  private ok = () => { this.cible = undefined; this.err = ''; this.charger(); };
  private ko = (e: any) => this.err = e.error?.message ?? 'Erreur.';
  valider(d: Declaration) { this.api.valider(d.id).subscribe({ next: this.ok, error: this.ko }); }
  rejeter() { this.api.rejeter(this.cible!.id, this.motif.trim()).subscribe({ next: this.ok, error: this.ko }); }
}
