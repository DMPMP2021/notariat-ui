// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// import { ApiService } from '../core/api.service';

// @Component({
//   selector: 'app-declaration-form',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, RouterLink],
//   styles: [`
//     .conteneur { width: 100%; max-width: 920px; margin-inline: auto; }
//     .retour { display: inline-block; margin-bottom: .6rem; font-size: .85rem; color: var(--muted); text-decoration: none; }
//     .retour:hover { color: var(--accent); }
//     .sous-titre { margin: -.4rem 0 1.1rem; color: var(--muted); font-size: .9rem; }
//     .req { color: var(--danger); font-weight: 700; }

//     .formulaire { padding: 0; overflow: hidden; }
//     .bloc { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--line); }
//     .bloc h2 { display: flex; align-items: center; gap: .6rem; margin: 0 0 1rem; font-size: 1rem; }
//     .num { display: inline-grid; place-items: center; width: 1.6rem; height: 1.6rem; border-radius: 50%;
//            background: var(--brand); color: #fff; font: 700 .8rem var(--font); }
//     .err { display: block; margin-top: .25rem; color: var(--danger); font-size: .8rem; }

//     /* montant avec l'unité DA */
//     .suffixe { position: relative; }
//     .suffixe input { padding-inline-end: 3rem; }
//     .suffixe .unite { position: absolute; inset-inline-end: .8rem; top: 50%; transform: translateY(-50%);
//                       color: var(--muted); font-weight: 600; font-size: .85rem; pointer-events: none; }
//     .apercu { margin-top: .25rem; color: var(--ok); font-size: .82rem; font-weight: 600; }

//     /* zone de dépôt du fichier */
//     .depot { display: flex; align-items: center; gap: 1rem; margin: 0; padding: 1rem 1.1rem; cursor: pointer;
//              border: 2px dashed #b8c2cc; border-radius: var(--radius-lg); background: #fafbfc;
//              font-size: .9rem; transition: border-color .15s, background-color .15s; }
//     .depot:hover { border-color: var(--brand); background: var(--brand-50); }
//     .depot:focus-within { outline: 3px solid var(--focus); outline-offset: 2px; }
//     .depot.rempli { border-style: solid; border-color: var(--ok); background: var(--ok-bg); }
//     .depot-icone { display: grid; place-items: center; flex: none; width: 2.6rem; height: 2.6rem; border-radius: 50%;
//                    background: var(--brand-50); color: var(--brand); }
//     .depot.rempli .depot-icone { background: var(--ok); color: #fff; }
//     .depot-texte strong { display: block; word-break: break-all; }
//     .depot-texte span { color: var(--muted); font-size: .82rem; font-weight: 400; }
//     .cache { position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important;
//              border: 0 !important; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

//     .info { display: flex; gap: .7rem; margin: 0; padding: .8rem 1rem; font-size: .88rem;
//             color: #184c87; background: var(--info-bg); border-inline-start: 4px solid var(--info); border-radius: var(--radius); }

//     .barre { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .75rem 1rem;
//              padding: 1rem 1.5rem; background: #f7f9fb; }
//     .aide { color: var(--muted); font-size: .82rem; }
//     .barre .actions { margin-inline-start: auto; }

//     @media (max-width: 600px) {
//       .bloc { padding: 1rem; }
//       .barre { padding: 1rem; }
//       .barre .actions { width: 100%; }
//     }
//   `],
//   template: `
//   <div class="conteneur">
//     <a class="retour" routerLink="/notaire/declarations">← Retour aux déclarations</a>
//     <h1>{{ id ? 'Modifier la déclaration' : 'Nouvelle déclaration' }}</h1>
//     <p class="sous-titre">Acte de vente · les champs marqués <span class="req">*</span> sont obligatoires</p>

//     <form class="card formulaire" [formGroup]="f" (ngSubmit)="save(false)" novalidate>

//       <section class="bloc">
//         <h2><span class="num">1</span> Parties</h2>
//         <div class="grid2">
//           <div class="field">
//             <label for="v">Vendeur <span class="req">*</span></label>
//             <input id="v" formControlName="vendeurNom" autocomplete="off" placeholder="Nom et prénom du vendeur">
//             <small class="err" *ngIf="invalide('vendeurNom')">Le nom du vendeur est obligatoire.</small>
//           </div>
//           <div class="field">
//             <label for="a">Acheteur <span class="req">*</span></label>
//             <input id="a" formControlName="acheteurNom" autocomplete="off" placeholder="Nom et prénom de l'acheteur">
//             <small class="err" *ngIf="invalide('acheteurNom')">Le nom de l'acheteur est obligatoire.</small>
//           </div>
//         </div>
//       </section>

//       <section class="bloc">
//         <h2><span class="num">2</span> Bien et montant</h2>
//         <div class="field">
//           <label for="b">Désignation du bien <span class="req">*</span></label>
//           <textarea id="b" rows="3" formControlName="designationBien" placeholder="Nature, situation et description du bien vendu"></textarea>
//           <small class="err" *ngIf="invalide('designationBien')">La désignation du bien est obligatoire.</small>
//         </div>
//         <div class="grid2">
//           <div class="field">
//             <label for="p">Montant de l'acte <span class="req">*</span></label>
//             <div class="suffixe">
//               <input id="p" type="number" min="0" step="0.01" inputmode="decimal" formControlName="prixVente">
//               <span class="unite">DA</span>
//             </div>
//             <div class="apercu" *ngIf="f.value.prixVente">{{ f.value.prixVente | number:'1.2-2' }} DA</div>
//             <small class="err" *ngIf="invalide('prixVente')">Saisissez un montant valide (0 ou plus).</small>
//           </div>
//           <div class="field">
//             <label for="d">Date de signature de l'acte <span class="req">*</span></label>
//             <input id="d" type="date" formControlName="dateActe">
//             <small class="err" *ngIf="invalide('dateActe')">La date de signature est obligatoire.</small>
//           </div>
//         </div>
//       </section>

//       <section class="bloc">
//         <h2><span class="num">3</span> Fichier de l'acte</h2>
//         <label class="depot" for="fi" [class.rempli]="fichierNom">
//           <input id="fi" class="cache" type="file" accept=".pdf,.doc,.docx" (change)="onFile($event)">
//           <span class="depot-icone" aria-hidden="true">
//             <svg *ngIf="!fichierNom" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3"/></svg>
//             <svg *ngIf="fichierNom" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>
//           </span>
//           <span class="depot-texte">
//             <strong *ngIf="fichierNom">{{ fichierNom }}</strong>
//             <strong *ngIf="!fichierNom">Cliquez pour joindre l'acte</strong>
//             <span>{{ fichierNom ? 'Cliquez pour remplacer le fichier' : 'Formats acceptés : PDF, DOC, DOCX (10 Mo maximum)' }}</span>
//           </span>
//         </label>
//       </section>

//       <section class="bloc">
//         <div class="info" role="note">
//           <span aria-hidden="true">ℹ</span>
//           <span><strong>Catégorie et droits :</strong> la catégorie de quittance, le taux et les droits sont déterminés
//             par l'inspecteur lors de la vérification de l'acte.</span>
//         </div>
//         <p class="error" *ngIf="err" role="alert" style="margin-top:1rem">{{ err }}</p>
//       </section>

//       <div class="barre">
//         <small class="aide" *ngIf="f.invalid">Remplissez les champs obligatoires pour continuer.</small>
//         <div class="actions">
//           <a class="btn ghost b-neutral" routerLink="/notaire/declarations">Annuler</a>
//           <button type="submit" class="ghost" [disabled]="f.invalid || busy">{{ busy ? 'Enregistrement…' : 'Enregistrer le brouillon' }}</button>
//           <button type="button" class="b-info" [disabled]="f.invalid || busy" (click)="save(true)">Enregistrer et envoyer à l'inspecteur</button>
//         </div>
//       </div>
//     </form>
//   </div>`
// })
// export class DeclarationFormComponent implements OnInit {
//   id?: number; err = ''; busy = false; fichierNom = '';
//   f = this.fb.nonNullable.group({
//     vendeurNom: ['', Validators.required], acheteurNom: ['', Validators.required],
//     designationBien: ['', Validators.required], prixVente: [0, [Validators.required, Validators.min(0)]],
//     dateActe: [new Date().toISOString().slice(0, 10), Validators.required],
//     cheminFichier: ['']
//   });
//   constructor(private fb: FormBuilder, private api: ApiService, private route: ActivatedRoute, private router: Router) {}

//   /** Message d'erreur affiché sous un champ touché et invalide. */
//   invalide(nom: string) { const c = this.f.get(nom); return !!c && c.invalid && c.touched; }

//   ngOnInit() {
//     const p = this.route.snapshot.paramMap.get('id');
//     if (p && p !== 'nouvelle') {
//       this.id = +p;
//       this.api.detail(this.id).subscribe(d => {
//         this.f.patchValue({ ...d, dateActe: d.dateActe.slice(0, 10), cheminFichier: d.cheminFichier ?? '' });
//         this.fichierNom = d.cheminFichier ? 'fichier déjà joint' : '';
//       });
//     }
//   }

//   onFile(ev: Event) {
//     const file = (ev.target as HTMLInputElement).files?.[0];
//     if (!file) return;
//     this.err = '';
//     this.api.upload(file).subscribe({
//       next: r => { this.f.patchValue({ cheminFichier: r.fileName }); this.fichierNom = file.name; },
//       error: e => this.err = e.error?.message ?? "Échec de l'envoi du fichier."
//     });
//   }

//   save(envoyer: boolean) {
//     this.busy = true; this.err = '';
//     const { cheminFichier, ...rest } = this.f.getRawValue();
//     const body = { ...rest, cheminFichier: cheminFichier || null };
//     const req = this.id ? this.api.modifier(this.id, body) : this.api.creer(body);
//     req.subscribe({
//       next: d => {
//         if (!envoyer) return this.done();
//         this.api.soumettre(d.id).subscribe({ next: () => this.done(), error: e => this.fail(e) });
//       },
//       error: e => this.fail(e)
//     });
//   }
//   private done() { this.router.navigate(['/notaire/declarations']); }
//   private fail(e: any) { this.busy = false; this.err = typeof e.error === 'string' ? e.error : e.error?.message ?? 'Enregistrement impossible.'; }
// }
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, debounceTime, of, switchMap, catchError } from 'rxjs';
import { ApiService, Calcul, Categorie, DetailQ } from '../core/api.service';

@Component({
  selector: 'app-declaration-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styles: [`
    .conteneur { width: 100%; max-width: 920px; margin-inline: auto; }
    .retour { display: inline-block; margin-bottom: .6rem; font-size: .85rem; color: var(--muted); text-decoration: none; }
    .retour:hover { color: var(--accent); }
    .sous-titre { margin: -.4rem 0 1.1rem; color: var(--muted); font-size: .9rem; }
    .req { color: var(--danger); font-weight: 700; }

    .formulaire { padding: 0; overflow: hidden; }
    .bloc { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--line); }
    .bloc h2 { display: flex; align-items: center; gap: .6rem; margin: 0 0 1rem; font-size: 1rem; }
    .num { display: inline-grid; place-items: center; width: 1.6rem; height: 1.6rem; border-radius: 50%;
           background: var(--brand); color: #fff; font: 700 .8rem var(--font); }
    .err { display: block; margin-top: .25rem; color: var(--danger); font-size: .8rem; }

    /* étape 1 : type de droit */
    .etape1 { background: #f7fbf9; }
    .tarif { margin-top: .75rem; padding: .7rem 1rem; border-radius: var(--radius); font-size: .9rem;
             background: var(--brand-50); border-inline-start: 4px solid var(--brand); }
    .attente { margin: .25rem 0 0; color: var(--muted); font-size: .88rem; }

    /* montant avec l'unité DA */
    .suffixe { position: relative; }
    .suffixe input { padding-inline-end: 3rem; }
    .suffixe .unite { position: absolute; inset-inline-end: .8rem; top: 50%; transform: translateY(-50%);
                      color: var(--muted); font-weight: 600; font-size: .85rem; pointer-events: none; }
    .apercu { margin-top: .25rem; color: var(--ok); font-size: .82rem; font-weight: 600; }

    /* estimation des droits */
    .estimation { margin-top: 1rem; padding: .85rem 1rem; border-radius: var(--radius); background: var(--ok-bg);
                  border-inline-start: 4px solid var(--ok); font-size: .9rem; }
    .estimation .total { font-size: 1.05rem; }
    .estimation small { display: block; margin-top: .3rem; color: var(--muted); }

    /* zone de dépôt du fichier */
    .depot { display: flex; align-items: center; gap: 1rem; margin: 0; padding: 1rem 1.1rem; cursor: pointer;
             border: 2px dashed #b8c2cc; border-radius: var(--radius-lg); background: #fafbfc;
             font-size: .9rem; transition: border-color .15s, background-color .15s; }
    .depot:hover { border-color: var(--brand); background: var(--brand-50); }
    .depot:focus-within { outline: 3px solid var(--focus); outline-offset: 2px; }
    .depot.rempli { border-style: solid; border-color: var(--ok); background: var(--ok-bg); }
    .depot-icone { display: grid; place-items: center; flex: none; width: 2.6rem; height: 2.6rem; border-radius: 50%;
                   background: var(--brand-50); color: var(--brand); }
    .depot.rempli .depot-icone { background: var(--ok); color: #fff; }
    .depot-texte strong { display: block; word-break: break-all; }
    .depot-texte span { color: var(--muted); font-size: .82rem; font-weight: 400; }
    .cache { position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important;
             border: 0 !important; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

    .barre { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .75rem 1rem;
             padding: 1rem 1.5rem; background: #f7f9fb; }
    .aide { color: var(--muted); font-size: .82rem; }
    .barre .actions { margin-inline-start: auto; }

    @media (max-width: 600px) {
      .bloc { padding: 1rem; }
      .barre { padding: 1rem; }
      .barre .actions { width: 100%; }
    }
  `],
  template: `
  <div class="conteneur">
    <a class="retour" routerLink="/notaire/declarations">← Retour aux déclarations</a>
    <h1>{{ id ? 'Modifier la déclaration' : 'Nouvelle déclaration' }}</h1>
    <p class="sous-titre">Choisissez d'abord le type de droit : le formulaire s'affiche ensuite. Les champs marqués <span class="req">*</span> sont obligatoires.</p>

    <form class="card formulaire" [formGroup]="f" (ngSubmit)="save(false)" novalidate>

      <!-- ÉTAPE 1 : catégorie et type de droit (CodeQ) -->
      <section class="bloc etape1">
        <h2><span class="num">1</span> Type de droit</h2>
        <div class="grid2">
          <div class="field">
            <label for="cat">Catégorie de quittance <span class="req">*</span></label>
            <select id="cat" formControlName="codeCategQ" (change)="onCategorie()">
              <option value="">— Choisir la catégorie —</option>
              <option *ngFor="let c of categories" [value]="c.codeCategQ">{{ c.libelleCategQFr }}</option>
            </select>
          </div>
          <div class="field">
            <label for="q">Type de droit <span class="req">*</span></label>
            <select id="q" formControlName="codeQ">
              <option value="">{{ f.value.codeCategQ ? '— Choisir le type de droit —' : '— Choisissez d\\'abord la catégorie —' }}</option>
              <option *ngFor="let d of detailsFiltres" [value]="d.codeQ">{{ d.libelleQFr }}</option>
            </select>
          </div>
        </div>
        <div class="tarif" *ngIf="detailChoisi" aria-live="polite">
          <strong>{{ detailChoisi.libelleQFr }}</strong> ·
          {{ detailChoisi.taux > 0 ? 'taux de ' + detailChoisi.taux + ' % du montant de l\\'acte' : 'tarif fixe de ' + (detailChoisi.tarif | number:'1.2-2') + ' DA' }}
        </div>
        <p class="attente" *ngIf="!choisi">Le formulaire de déclaration s'affichera dès que vous aurez choisi le type de droit.</p>
      </section>

      <ng-container *ngIf="choisi">
        <section class="bloc">
          <h2><span class="num">2</span> Parties</h2>
          <div class="grid2">
            <div class="field">
              <label for="v">Vendeur <span class="req">*</span></label>
              <input id="v" formControlName="vendeurNom" autocomplete="off" placeholder="Nom et prénom du vendeur">
              <small class="err" *ngIf="invalide('vendeurNom')">Le nom du vendeur est obligatoire.</small>
            </div>
            <div class="field">
              <label for="a">Acheteur <span class="req">*</span></label>
              <input id="a" formControlName="acheteurNom" autocomplete="off" placeholder="Nom et prénom de l'acheteur">
              <small class="err" *ngIf="invalide('acheteurNom')">Le nom de l'acheteur est obligatoire.</small>
            </div>
          </div>
        </section>

        <section class="bloc">
          <h2><span class="num">3</span> Bien et montant</h2>
          <div class="field">
            <label for="b">Désignation du bien <span class="req">*</span></label>
            <textarea id="b" rows="3" formControlName="designationBien" placeholder="Nature, situation et description du bien vendu"></textarea>
            <small class="err" *ngIf="invalide('designationBien')">La désignation du bien est obligatoire.</small>
          </div>
          <div class="grid2">
            <div class="field">
              <label for="p">Montant de l'acte <span class="req">*</span></label>
              <div class="suffixe">
                <input id="p" type="number" min="0" step="0.01" inputmode="decimal" formControlName="prixVente">
                <span class="unite">DA</span>
              </div>
              <div class="apercu" *ngIf="f.value.prixVente">{{ f.value.prixVente | number:'1.2-2' }} DA</div>
              <small class="err" *ngIf="invalide('prixVente')">Saisissez un montant valide (0 ou plus).</small>
            </div>
            <div class="field">
              <label for="d">Date de signature de l'acte <span class="req">*</span></label>
              <input id="d" type="date" formControlName="dateActe">
              <small class="err" *ngIf="invalide('dateActe')">La date de signature est obligatoire.</small>
            </div>
          </div>

          <div class="estimation" *ngIf="calcul" aria-live="polite">
            <div>Droits estimés : <strong>{{ calcul.prix | number:'1.2-2' }} DA</strong> ·
              Pénalité : <strong>{{ calcul.penalite | number:'1.2-2' }} DA</strong>
              <span *ngIf="calcul.moisRetard > 0"> ({{ calcul.moisRetard }} mois de retard, {{ calcul.penalitePct }} %)</span></div>
            <div class="total">Total estimé : <strong>{{ calcul.total | number:'1.2-2' }} DA</strong></div>
            <small>Estimation indicative : le montant définitif est confirmé par l'inspecteur.</small>
          </div>
        </section>

        <section class="bloc">
          <h2><span class="num">4</span> Fichier de l'acte</h2>
          <label class="depot" for="fi" [class.rempli]="fichierNom">
            <input id="fi" class="cache" type="file" accept=".pdf,.doc,.docx" (change)="onFile($event)">
            <span class="depot-icone" aria-hidden="true">
              <svg *ngIf="!fichierNom" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3"/></svg>
              <svg *ngIf="fichierNom" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>
            </span>
            <span class="depot-texte">
              <strong *ngIf="fichierNom">{{ fichierNom }}</strong>
              <strong *ngIf="!fichierNom">Cliquez pour joindre l'acte</strong>
              <span>{{ fichierNom ? 'Cliquez pour remplacer le fichier' : 'Formats acceptés : PDF, DOC, DOCX (10 Mo maximum)' }}</span>
            </span>
          </label>
        </section>
      </ng-container>

      <p class="error" *ngIf="err" role="alert" style="margin:1rem 1.5rem">{{ err }}</p>

      <div class="barre">
        <small class="aide" *ngIf="f.invalid">{{ choisi ? 'Remplissez les champs obligatoires pour continuer.' : 'Choisissez le type de droit pour continuer.' }}</small>
        <div class="actions">
          <a class="btn ghost b-neutral" routerLink="/notaire/declarations">Annuler</a>
          <button type="submit" class="ghost" [disabled]="f.invalid || busy">{{ busy ? 'Enregistrement…' : 'Enregistrer le brouillon' }}</button>
          <button type="button" class="b-info" [disabled]="f.invalid || busy" (click)="save(true)">Enregistrer et envoyer à l'inspecteur</button>
        </div>
      </div>
    </form>
  </div>`
})
export class DeclarationFormComponent implements OnInit, OnDestroy {
  id?: number; err = ''; busy = false; fichierNom = '';
  categories: Categorie[] = []; details: DetailQ[] = []; calcul?: Calcul;
  private sub = new Subscription();

  f = this.fb.nonNullable.group({
    codeCategQ: [''],                                    // aide à la saisie : n'est pas envoyée au serveur
    codeQ: ['', Validators.required],
    vendeurNom: ['', Validators.required], acheteurNom: ['', Validators.required],
    designationBien: ['', Validators.required], prixVente: [0, [Validators.required, Validators.min(0)]],
    dateActe: [new Date().toISOString().slice(0, 10), Validators.required],
    cheminFichier: ['']
  });
  constructor(private fb: FormBuilder, private api: ApiService, private route: ActivatedRoute, private router: Router) {}

  /** Le formulaire de déclaration s'affiche dès qu'un type de droit (CodeQ) est choisi. */
  get choisi() { return !!this.f.value.codeQ; }
  get detailsFiltres() { const c = this.f.value.codeCategQ; return this.details.filter(d => !!c && d.codeCategQ === c); }
  get detailChoisi() { return this.details.find(d => d.codeQ === this.f.value.codeQ); }

  /** Message d'erreur affiché sous un champ touché et invalide. */
  invalide(nom: string) { const c = this.f.get(nom); return !!c && c.invalid && c.touched; }
  onCategorie() { this.f.patchValue({ codeQ: '' }); this.calcul = undefined; }

  ngOnInit() {
    this.api.categories().subscribe(l => this.categories = l);
    this.api.details().subscribe(l => {
      this.details = l;
      const p = this.route.snapshot.paramMap.get('id');
      if (p && p !== 'nouvelle') {
        this.id = +p;
        this.api.detail(this.id).subscribe(d => {
          const det = l.find(x => x.codeQ === d.codeQ);
          this.f.patchValue({ ...d, codeQ: d.codeQ ?? '', codeCategQ: det?.codeCategQ ?? '',
            dateActe: d.dateActe.slice(0, 10), cheminFichier: d.cheminFichier ?? '' });
          this.fichierNom = d.cheminFichier ? 'fichier déjà joint' : '';
        });
      }
    });

    // estimation des droits dès que le type de droit, le montant et la date sont connus
    this.sub.add(this.f.valueChanges.pipe(
      debounceTime(300),
      switchMap(v => !v.codeQ || !v.dateActe || (v.prixVente ?? 0) < 0 ? of(undefined)
        : this.api.calcul(v.codeQ, v.prixVente ?? 0, v.dateActe).pipe(catchError(() => of(undefined))))
    ).subscribe(c => this.calcul = c));
  }
  ngOnDestroy() { this.sub.unsubscribe(); }

  onFile(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.err = '';
    this.api.upload(file).subscribe({
      next: r => { this.f.patchValue({ cheminFichier: r.fileName }); this.fichierNom = file.name; },
      error: e => this.err = e.error?.message ?? "Échec de l'envoi du fichier."
    });
  }

  save(envoyer: boolean) {
    this.busy = true; this.err = '';
    const { codeCategQ, cheminFichier, ...rest } = this.f.getRawValue();
    const body = { ...rest, cheminFichier: cheminFichier || null };      // rest contient codeQ
    const req = this.id ? this.api.modifier(this.id, body) : this.api.creer(body);
    req.subscribe({
      next: d => {
        if (!envoyer) return this.done();
        this.api.soumettre(d.id).subscribe({ next: () => this.done(), error: e => this.fail(e) });
      },
      error: e => this.fail(e)
    });
  }
  private done() { this.router.navigate(['/notaire/declarations']); }
  private fail(e: any) { this.busy = false; this.err = typeof e.error === 'string' ? e.error : e.error?.message ?? 'Enregistrement impossible.'; }
}