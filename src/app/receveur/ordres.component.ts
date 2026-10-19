import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Ordre, PaiementRow } from '../core/api.service';
import { NotificationService } from '../core/notification.service';

@Component({
  selector: 'app-ordres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="toolbar"><h1>Ordres de versement à encaisser</h1>
    <div class="actions">
      <input type="search" style="max-width:260px" placeholder="Rechercher (n° ordre, acte, notaire, quittance...)"
             [(ngModel)]="q" (keyup.escape)="q = ''" autocomplete="off" aria-label="Rechercher">
      <button class="ghost" *ngIf="q" (click)="q = ''">Effacer</button>
    </div>
  </div>
  <p class="error" *ngIf="err">{{ err }}</p>
  <p *ngIf="derniere" style="color:var(--ok)">Paiement validé. Quittance n° <strong>{{ derniere.num }}</strong>
    <button class="ghost" style="margin-left:.6rem" (click)="api.telechargerQuittance(derniere.ordreId, derniere.num, derniere.pdf)">Télécharger la quittance</button></p>

  <div class="empty" *ngIf="!filtres.length && !q">Aucun ordre de versement en attente.</div>
  <div class="empty" *ngIf="!filtres.length && q">Aucun ordre trouvé pour cette recherche.</div>
  <div class="table-wrap" *ngIf="filtres.length"><table>
    <tr><th>N° ordre</th><th>Acte</th><th>Notaire</th><th class="num">Montant (DA)</th><th></th></tr>
    <tr *ngFor="let o of filtres">
      <td>{{ o.numero }}</td><td>{{ o.declaration.reference }}</td><td>{{ o.declaration.notaire?.nomComplet }}</td>
      <td class="num">{{ o.montant | number:'1.2-2' }}</td>
      <td><button (click)="ouvrirEncaissement(o)">Encaisser</button></td>
    </tr>
  </table></div>

  <h2 style="margin-top:2rem">Mes quittances délivrées</h2>
  <div class="empty" *ngIf="!paiementsFiltres.length && !q">Aucune quittance délivrée pour le moment.</div>
  <div class="empty" *ngIf="!paiementsFiltres.length && q">Aucune quittance trouvée pour cette recherche.</div>
  <div class="table-wrap" *ngIf="paiementsFiltres.length"><table>
    <tr><th>N° quittance</th><th>N° ordre</th><th>Acte</th><th class="num">Montant (DA)</th><th>Date</th><th>PDF joint</th><th></th></tr>
    <tr *ngFor="let p of paiementsFiltres">
      <td><strong>{{ p.numeroQuittance }}</strong></td>
      <td>{{ p.ordreVersement.numero }}</td><td>{{ p.ordreVersement.declaration.reference }}</td>
      <td class="num">{{ p.ordreVersement.montant | number:'1.2-2' }}</td>
      <td>{{ p.datePaiement | date:'dd/MM/yyyy HH:mm' }}</td>
      <td>{{ p.fichierQuittance ? 'Oui' : '—' }}</td>
      <td class="actions">
        <button class="ghost" *ngIf="p.ordreVersement.declaration.statut === 'Payee'" (click)="ouvrirCorrection(p)">Modifier le n°</button>
        <button class="ghost" (click)="api.telechargerQuittance(p.ordreVersement.id, p.numeroQuittance, !!p.fichierQuittance)">PDF</button>
      </td>
    </tr>
  </table></div>

  <!-- Encaissement : le receveur saisit le numéro de la quittance -->
  <div class="modal-bg" *ngIf="aEncaisser" (click)="aEncaisser = undefined">
    <div class="card modal" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
      <h2>Encaisser {{ aEncaisser.numero }}</h2>
      <p style="margin-top:0">Montant : <strong>{{ aEncaisser.montant | number:'1.2-2' }} DA</strong></p>
      <div class="field"><label for="nq">N° de quittance</label>
        <input id="nq" [(ngModel)]="numero" maxlength="50" autocomplete="off" (keyup.enter)="confirmer()"></div>
      <div class="field"><label for="qf1">Quittance en PDF (facultatif)</label>
        <input id="qf1" type="file" accept=".pdf,application/pdf" (change)="onFile($event)">
        <small *ngIf="fichierNom" style="color:var(--ok)">Fichier joint : {{ fichierNom }}</small></div>
      <p class="error" *ngIf="errModal">{{ errModal }}</p>
      <div class="actions">
        <button [disabled]="!numero.trim() || busy" (click)="confirmer()">Valider le paiement</button>
        <button class="ghost" (click)="aEncaisser = undefined">Annuler</button>
      </div>
    </div>
  </div>

  <!-- Correction du numéro -->
  <div class="modal-bg" *ngIf="aCorriger" (click)="aCorriger = undefined">
    <div class="card modal" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
      <h2>Modifier le n° de quittance</h2>
      <p style="margin-top:0;color:var(--muted)">Ordre {{ aCorriger.ordreVersement.numero }} · actuel : {{ aCorriger.numeroQuittance }}</p>
      <div class="field"><label for="nq2">Nouveau n° de quittance</label>
        <input id="nq2" [(ngModel)]="numero" maxlength="50" autocomplete="off" (keyup.enter)="corriger()"></div>
      <div class="field"><label for="qf2">Quittance en PDF (facultatif : remplace le fichier actuel)</label>
        <input id="qf2" type="file" accept=".pdf,application/pdf" (change)="onFile($event)">
        <small *ngIf="fichierNom" style="color:var(--ok)">Fichier joint : {{ fichierNom }}</small></div>
      <p class="error" *ngIf="errModal">{{ errModal }}</p>
      <div class="actions">
        <button [disabled]="!numero.trim() || busy" (click)="corriger()">Enregistrer</button>
        <button class="ghost" (click)="aCorriger = undefined">Annuler</button>
      </div>
    </div>
  </div>`
})
export class OrdresComponent implements OnInit {
  items: Ordre[] = []; paiements: PaiementRow[] = []; q = ''; err = '';
  derniere?: { num: string; ordreId: number; pdf: boolean };
  aEncaisser?: Ordre; aCorriger?: PaiementRow; numero = ''; errModal = ''; busy = false;
  fichierServeur?: string; fichierNom = '';

  constructor(public api: ApiService, private notif: NotificationService) {}

  // ----- recherche : insensible à la casse et aux accents, sur plusieurs champs -----
  private norm(v: unknown): string {
    return String(v ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  private correspond(...champs: unknown[]): boolean {
    const t = this.norm(this.q).trim();
    return !t || champs.some(c => this.norm(c).includes(t));
  }
  get filtres(): Ordre[] {
    return this.items.filter(o => this.correspond(
      o.numero, o.declaration?.reference, o.declaration?.notaire?.nomComplet,
      o.declaration?.vendeurNom, o.declaration?.acheteurNom, o.montant));
  }
  get paiementsFiltres(): PaiementRow[] {
    return this.paiements.filter(p => this.correspond(
      p.numeroQuittance, p.ordreVersement?.numero, p.ordreVersement?.declaration?.reference,
      p.ordreVersement?.montant));
  }

  ngOnInit() { this.charger(); this.notif.incoming$.subscribe(() => this.charger()); }
  charger() {
    this.api.ordresAPayer().subscribe(l => this.items = l);
    this.api.paiementsEffectues().subscribe(l => this.paiements = l);
  }

  ouvrirEncaissement(o: Ordre) { this.aEncaisser = o; this.numero = ''; this.errModal = ''; this.fichierServeur = undefined; this.fichierNom = ''; }
  onFile(ev: Event) {
    const f = (ev.target as HTMLInputElement).files?.[0];
    if (!f) return;
    this.errModal = '';
    this.api.uploadQuittance(f).subscribe({
      next: r => { this.fichierServeur = r.fileName; this.fichierNom = f.name; },
      error: e => { this.fichierServeur = undefined; this.fichierNom = ''; this.errModal = e.error?.message ?? "Échec de l'envoi du fichier."; }
    });
  }
  confirmer() {
    if (!this.aEncaisser || !this.numero.trim()) return;
    this.busy = true; this.errModal = '';
    const o = this.aEncaisser;
    this.api.payer(o.id, this.numero.trim(), this.fichierServeur).subscribe({
      next: r => { this.busy = false; this.aEncaisser = undefined; this.err = ''; this.derniere = { num: r.numeroQuittance, ordreId: o.id, pdf: !!this.fichierServeur }; this.charger(); },
      error: e => { this.busy = false; this.errModal = e.error?.message ?? 'Paiement impossible.'; }
    });
  }

  ouvrirCorrection(p: PaiementRow) { this.aCorriger = p; this.numero = p.numeroQuittance; this.errModal = ''; this.fichierServeur = undefined; this.fichierNom = ''; }
  corriger() {
    if (!this.aCorriger || !this.numero.trim()) return;
    this.busy = true; this.errModal = '';
    this.api.modifierQuittance(this.aCorriger.ordreVersement.id, this.numero.trim(), this.fichierServeur).subscribe({
      next: () => { this.busy = false; this.aCorriger = undefined; this.charger(); },
      error: e => { this.busy = false; this.errModal = e.error?.message ?? 'Modification impossible.'; }
    });
  }
}