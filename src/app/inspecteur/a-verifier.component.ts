// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ApiService, Calcul, Categorie, Declaration, DetailQ } from '../core/api.service';
// import { NotificationService } from '../core/notification.service';

// @Component({
//   selector: 'app-a-verifier',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   styles: ['select { width: 100%; font: inherit; padding: .5rem .6rem; border: 1px solid #aeb7c0; border-radius: 6px; background: #fff; } .wide { width: min(560px, 100%); }'],
//   template: `
//   <h1>Déclarations à vérifier</h1>
//   <p class="error" *ngIf="err">{{ err }}</p>
//   <div class="empty" *ngIf="!items.length">Aucune déclaration en attente.</div>
//   <div class="table-wrap" *ngIf="items.length"><table>
//     <tr><th>Référence</th><th>Notaire</th><th>Vendeur → Acheteur</th><th>Bien</th><th class="num">Montant (DA)</th><th>Date acte</th><th>Fichier</th><th></th></tr>
//     <tr *ngFor="let d of items">
//       <td>{{ d.reference }}</td><td>{{ d.notaire?.nomComplet }}</td>
//       <td>{{ d.vendeurNom }} → {{ d.acheteurNom }}</td><td>{{ d.designationBien }}</td>
//       <td class="num">{{ d.prixVente | number:'1.2-2' }}</td><td>{{ d.dateActe | date:'dd/MM/yyyy' }}</td>
//       <td><button class="ghost" *ngIf="d.cheminFichier" (click)="api.fichier(d)">Voir l'acte</button><span *ngIf="!d.cheminFichier">—</span></td>
//       <td class="actions"><button (click)="ouvrirValidation(d)">Valider</button><button class="danger" (click)="cible = d; motif = ''">Rejeter</button></td>
//     </tr>
//   </table></div>

//   <!-- Validation : l'inspecteur choisit la catégorie et le détail, le taux est récupéré automatiquement -->
//   <div class="modal-bg" *ngIf="aValider" (click)="aValider = undefined">
//     <div class="card modal wide" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
//       <h2>Valider {{ aValider.reference }}</h2>
//       <p style="margin-top:0;color:var(--muted)">Montant de l'acte : <strong>{{ aValider.prixVente | number:'1.2-2' }} DA</strong> ·
//         Date de signature : {{ aValider.dateActe | date:'dd/MM/yyyy' }}</p>

//       <div class="field"><label for="cat">Catégorie de quittance</label>
//         <select id="cat" [(ngModel)]="cat" (ngModelChange)="onCat()">
//           <option value="">— Choisir —</option>
//           <option *ngFor="let c of categories" [value]="c.codeCategQ">{{ c.libelleCategQFr }}</option>
//         </select></div>
//       <div class="field"><label for="q">Détail (type de droit)</label>
//         <select id="q" [(ngModel)]="codeQ" (ngModelChange)="onDetail()" [disabled]="!cat">
//           <option value="">— Choisir —</option>
//           <option *ngFor="let d of detailsFiltres" [value]="d.codeQ">{{ d.libelleQFr }}</option>
//         </select></div>

//       <div class="card" style="background:#eef6f3;margin-bottom:1rem" *ngIf="detailChoisi" aria-live="polite">
//         <strong>{{ detailChoisi.taux > 0 ? 'Taux appliqué : ' + detailChoisi.taux + ' %' : 'Tarif fixe : ' + detailChoisi.tarif + ' DA' }}</strong>
//         <ng-container *ngIf="calcul">
//           <br>Droits : {{ calcul.prix | number:'1.2-2' }} DA · Pénalité : {{ calcul.penalite | number:'1.2-2' }} DA
//           <span *ngIf="calcul.moisRetard > 0">({{ calcul.moisRetard }} mois de retard, {{ calcul.penalitePct }} %)</span>
//           <br><strong>Total de l'ordre de versement : {{ calcul.total | number:'1.2-2' }} DA</strong>
//         </ng-container>
//       </div>
//       <p class="error" *ngIf="errModal">{{ errModal }}</p>
//       <div class="actions">
//         <button [disabled]="!calcul || busy" (click)="confirmerValidation()">Confirmer la validation</button>
//         <button class="ghost" (click)="aValider = undefined">Annuler</button>
//       </div>
//     </div>
//   </div>

//   <div class="modal-bg" *ngIf="cible" (click)="cible = undefined">
//     <div class="card modal" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
//       <h2>Rejeter {{ cible.reference }}</h2>
//       <div class="field"><label for="m">Motif du rejet (obligatoire)</label><textarea id="m" rows="4" [(ngModel)]="motif"></textarea></div>
//       <div class="actions">
//         <button class="danger" [disabled]="!motif.trim()" (click)="rejeter()">Confirmer le rejet</button>
//         <button class="ghost" (click)="cible = undefined">Annuler</button>
//       </div>
//     </div>
//   </div>`
// })
// export class AVerifierComponent implements OnInit {
//   items: Declaration[] = []; err = ''; errModal = ''; busy = false;
//   cible?: Declaration; motif = '';
//   aValider?: Declaration; cat = ''; codeQ = ''; calcul?: Calcul;
//   categories: Categorie[] = []; details: DetailQ[] = [];

//   constructor(public api: ApiService, private notif: NotificationService) {}

//   get detailsFiltres() { return this.details.filter(x => !this.cat || x.codeCategQ === this.cat); }
//   get detailChoisi() { return this.details.find(x => x.codeQ === this.codeQ); }

//   ngOnInit() {
//     this.charger();
//     this.notif.incoming$.subscribe(() => this.charger());
//     this.api.categories().subscribe(l => this.categories = l);
//     this.api.details().subscribe(l => this.details = l);
//   }
//   charger() { this.api.aVerifier().subscribe(l => this.items = l); }

//   ouvrirValidation(d: Declaration) {
//     this.aValider = d; this.cat = ''; this.codeQ = ''; this.calcul = undefined; this.errModal = '';
//   }
//   onCat() { this.codeQ = ''; this.calcul = undefined; this.errModal = ''; }
//   /** Dès que le détail est choisi, le taux/tarif est lu dans DetailQs et le montant calculé. */
//   onDetail() {
//     this.calcul = undefined; this.errModal = '';
//     if (!this.codeQ || !this.aValider) return;
//     this.api.calcul(this.codeQ, this.aValider.prixVente, this.aValider.dateActe.slice(0, 10)).subscribe({
//       next: c => this.calcul = c,
//       error: e => this.errModal = e.error?.message ?? 'Calcul impossible.'
//     });
//   }
//   confirmerValidation() {
//     if (!this.aValider || !this.codeQ) return;
//     this.busy = true;
//     this.api.valider(this.aValider.id, this.codeQ).subscribe({
//       next: () => { this.busy = false; this.aValider = undefined; this.err = ''; this.charger(); },
//       error: e => { this.busy = false; this.errModal = e.error?.message ?? 'Validation impossible.'; }
//     });
//   }

//   private ok = () => { this.cible = undefined; this.err = ''; this.charger(); };
//   private ko = (e: any) => this.err = e.error?.message ?? 'Erreur.';
//   rejeter() { this.api.rejeter(this.cible!.id, this.motif.trim()).subscribe({ next: this.ok, error: this.ko }); }
// }
import { RecherchePipe } from '../core/search.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Calcul, Categorie, Declaration, DetailQ } from '../core/api.service';
import { NotificationService } from '../core/notification.service';
import { PrintOvService } from '../core/print-ov.service';

@Component({
  selector: 'app-a-verifier',
  standalone: true,
  imports: [RecherchePipe, CommonModule, FormsModule],
  styles: ['select { width: 100%; font: inherit; padding: .5rem .6rem; border: 1px solid #aeb7c0; border-radius: 6px; background: #fff; } .wide { width: min(560px, 100%); }'],
  template: `
  <h1>Déclarations à vérifier</h1>
  <p class="error" *ngIf="err">{{ err }}</p>
  <div class="empty" *ngIf="!items.length">Aucune déclaration en attente.</div>
  <div class="table-wrap" *ngIf="items.length"><table>
    <tr><th>Référence</th><th>Notaire</th><th>Vendeur → Acheteur</th><th>Bien</th><th class="num">Montant (DA)</th><th>Date acte</th><th>Fichier</th><th></th></tr>
    <tr *ngFor="let d of items | recherche">
      <td>{{ d.reference }}</td><td>{{ d.notaire?.nomComplet }}</td>
      <td>{{ d.vendeurNom }} → {{ d.acheteurNom }}</td><td>{{ d.designationBien }}</td>
      <td class="num">{{ d.prixVente | number:'1.2-2' }}</td><td>{{ d.dateActe | date:'dd/MM/yyyy' }}</td>
      <td><button class="ghost" *ngIf="d.cheminFichier" (click)="api.fichier(d)">Voir l'acte</button><span *ngIf="!d.cheminFichier">—</span></td>
      <td class="actions"><button (click)="ouvrirValidation(d)">Valider</button><button class="danger" (click)="cible = d; motif = ''">Rejeter</button></td>
    </tr>
  </table></div>

  <!-- Validation : l'inspecteur choisit la catégorie et le détail, le taux est récupéré automatiquement -->
  <div class="modal-bg" *ngIf="aValider" (click)="aValider = undefined">
    <div class="card modal wide" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
      <h2>Valider {{ aValider.reference }}</h2>
      <ng-container *ngIf="!genere">
      <p style="margin-top:0;color:var(--muted)">Montant de l'acte : <strong>{{ aValider.prixVente | number:'1.2-2' }} DA</strong> ·
        Date de signature : {{ aValider.dateActe | date:'dd/MM/yyyy' }}</p>

      <div class="field"><label for="cat">Catégorie de quittance</label>
        <select id="cat" [(ngModel)]="cat" (ngModelChange)="onCat()">
          <option value="">— Choisir —</option>
          <option *ngFor="let c of categories" [value]="c.codeCategQ">{{ c.libelleCategQFr }}</option>
        </select></div>
      <div class="field"><label for="q">Détail (type de droit)</label>
        <select id="q" [(ngModel)]="codeQ" (ngModelChange)="onDetail()" [disabled]="!cat">
          <option value="">— Choisir —</option>
          <option *ngFor="let d of detailsFiltres" [value]="d.codeQ">{{ d.libelleQFr }}</option>
        </select></div>

      <div class="card" style="background:#eef6f3;margin-bottom:1rem" *ngIf="detailChoisi" aria-live="polite">
        <strong>{{ detailChoisi.taux > 0 ? 'Taux appliqué : ' + detailChoisi.taux + ' %' : 'Tarif fixe : ' + detailChoisi.tarif + ' DA' }}</strong>
        <ng-container *ngIf="calcul">
          <br>Droits : {{ calcul.prix | number:'1.2-2' }} DA · Pénalité : {{ calcul.penalite | number:'1.2-2' }} DA
          <span *ngIf="calcul.moisRetard > 0">({{ calcul.moisRetard }} mois de retard, {{ calcul.penalitePct }} %)</span>
          <br><strong>Total de l'ordre de versement : {{ calcul.total | number:'1.2-2' }} DA</strong>
        </ng-container>
      </div>
      <p class="error" *ngIf="errModal">{{ errModal }}</p>
      <div class="actions">
        <button [disabled]="!calcul || busy" (click)="confirmerValidation()">Valider et générer l'ordre de versement</button>
        <button class="ghost" (click)="aValider = undefined">Annuler</button>
      </div>
      </ng-container>

      <!-- Résultat : l'ordre de versement vient d'être généré -->
      <ng-container *ngIf="genere">
        <div class="card" style="background:#eef6f3;margin-bottom:1rem" aria-live="polite">
          <strong>Ordre de versement généré</strong><br>
          N° {{ genere.ordreVersement?.numero }} · Total : <strong>{{ genere.ordreVersement?.montant | number:'1.2-2' }} DA</strong><br>
          <span style="color:var(--muted)">Le notaire a été notifié : l'acte est en instance de paiement.</span>
        </div>
        <div class="actions">
          <button (click)="imprimer('fr')">Imprimer (FR)</button>
          <button (click)="imprimer('ar')">طباعة (AR)</button>
          <button class="ghost" (click)="api.ordrePdf(genere)">PDF simple</button>
          <button class="ghost" (click)="fermer()">Fermer</button>
        </div>
      </ng-container>
    </div>
  </div>

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
  items: Declaration[] = []; err = ''; errModal = ''; busy = false;
  cible?: Declaration; motif = '';
  aValider?: Declaration; genere?: Declaration; cat = ''; codeQ = ''; calcul?: Calcul;
  categories: Categorie[] = []; details: DetailQ[] = [];

  constructor(public api: ApiService, private notif: NotificationService, private print: PrintOvService) {}

  get detailsFiltres() { return this.details.filter(x => !this.cat || x.codeCategQ === this.cat); }
  get detailChoisi() { return this.details.find(x => x.codeQ === this.codeQ); }

  ngOnInit() {
    this.charger();
    this.notif.incoming$.subscribe(() => this.charger());
    this.api.categories().subscribe(l => this.categories = l);
    this.api.details().subscribe(l => this.details = l);
  }
  charger() { this.api.aVerifier().subscribe(l => this.items = l); }

  ouvrirValidation(d: Declaration) {
    this.aValider = d; this.genere = undefined; this.cat = ''; this.codeQ = ''; this.calcul = undefined; this.errModal = '';
  }
  onCat() { this.codeQ = ''; this.calcul = undefined; this.errModal = ''; }
  /** Dès que le détail est choisi, le taux/tarif est lu dans DetailQs et le montant calculé. */
  onDetail() {
    this.calcul = undefined; this.errModal = '';
    if (!this.codeQ || !this.aValider) return;
    this.api.calcul(this.codeQ, this.aValider.prixVente, this.aValider.dateActe.slice(0, 10)).subscribe({
      next: c => this.calcul = c,
      error: e => this.errModal = e.error?.message ?? 'Calcul impossible.'
    });
  }
  confirmerValidation() {
    if (!this.aValider || !this.codeQ) return;
    this.busy = true;
    this.api.valider(this.aValider.id, this.codeQ).subscribe({
      next: () => {
        this.busy = false; this.err = ''; this.charger();
        // récupère l'acte avec son ordre de versement fraîchement généré
        this.api.detail(this.aValider!.id).subscribe({ next: d => this.genere = d, error: () => this.aValider = undefined });
      },
      error: e => { this.busy = false; this.errModal = e.error?.message ?? 'Validation impossible.'; }
    });
  }

  imprimer(lang: 'fr' | 'ar') {
    if (!this.genere) return;
    const q = this.details.find(x => x.codeQ === this.genere!.codeQ);
    this.print.imprimer(this.genere, lang, q?.libelleQFr ?? '', q?.libelleQAr ?? '');
  }
  fermer() { this.aValider = undefined; this.genere = undefined; }

  private ok = () => { this.cible = undefined; this.err = ''; this.charger(); };
  private ko = (e: any) => this.err = e.error?.message ?? 'Erreur.';
  rejeter() { this.api.rejeter(this.cible!.id, this.motif.trim()).subscribe({ next: this.ok, error: this.ko }); }
}
