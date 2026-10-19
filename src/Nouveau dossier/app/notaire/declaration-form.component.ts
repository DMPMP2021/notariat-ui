import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime } from 'rxjs';
import { ApiService, Calcul, Categorie, DetailQ } from '../core/api.service';

@Component({
  selector: 'app-declaration-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <h1>{{ id ? 'Modifier la déclaration' : 'Nouvelle déclaration : acte de vente' }}</h1>
  <form class="card" [formGroup]="f" (ngSubmit)="save(false)">
    <div class="grid2">
      <div class="field"><label for="cat">Catégorie de quittance</label>
        <select id="cat" formControlName="codeCategQ" (change)="f.patchValue({ codeQ: '' })">
          <option value="">— Choisir —</option>
          <option *ngFor="let c of categories" [value]="c.codeCategQ">{{ c.libelleCategQFr }}</option>
        </select></div>
      <div class="field"><label for="q">Type de droit</label>
        <select id="q" formControlName="codeQ">
          <option value="">— Choisir —</option>
          <option *ngFor="let d of detailsFiltres" [value]="d.codeQ">{{ d.libelleQFr }}</option>
        </select>
        <small *ngIf="detailChoisi" style="color:var(--muted)">
          {{ detailChoisi.taux > 0 ? 'Taux : ' + detailChoisi.taux + ' %' : 'Tarif fixe : ' + detailChoisi.tarif + ' DA' }}</small></div>
    </div>
    <div class="grid2">
      <div class="field"><label for="v">Vendeur</label><input id="v" formControlName="vendeurNom"></div>
      <div class="field"><label for="a">Acheteur</label><input id="a" formControlName="acheteurNom"></div>
    </div>
    <div class="field"><label for="b">Désignation du bien</label><textarea id="b" rows="3" formControlName="designationBien"></textarea></div>
    <div class="grid2">
      <div class="field"><label for="p">Montant de l'acte (DA)</label><input id="p" type="number" min="0" formControlName="prixVente"></div>
      <div class="field"><label for="d">Date de signature de l'acte</label><input id="d" type="date" formControlName="dateActe"></div>
    </div>
    <div class="field"><label for="fi">Fichier de l'acte (PDF, DOC, DOCX)</label>
      <input id="fi" type="file" accept=".pdf,.doc,.docx" (change)="onFile($event)">
      <small *ngIf="fichierNom" style="color:var(--ok)">Fichier joint : {{ fichierNom }}</small></div>

    <div class="card" style="background:#eef6f3;margin-bottom:1rem" *ngIf="calcul" aria-live="polite">
      <strong>Montant à payer</strong><br>
      Droits : {{ calcul.prix | number:'1.2-2' }} DA ·
      Pénalité : {{ calcul.penalite | number:'1.2-2' }} DA
      <span *ngIf="calcul.moisRetard > 0">({{ calcul.moisRetard }} mois de retard, {{ calcul.penalitePct }} %)</span><br>
      <strong>Total : {{ calcul.total | number:'1.2-2' }} DA</strong>
    </div>
    <p class="error" *ngIf="err">{{ err }}</p>
    <div class="actions">
      <button type="submit" class="ghost" [disabled]="f.invalid || busy">Enregistrer le brouillon</button>
      <button type="button" [disabled]="f.invalid || busy" (click)="save(true)">Enregistrer et envoyer à l'inspecteur</button>
    </div>
  </form>`,
  styles: ['select { width: 100%; font: inherit; padding: .5rem .6rem; border: 1px solid #aeb7c0; border-radius: 6px; background: #fff; }']
})
export class DeclarationFormComponent implements OnInit {
  id?: number; err = ''; busy = false; fichierNom = '';
  categories: Categorie[] = []; details: DetailQ[] = []; calcul?: Calcul;
  f = this.fb.nonNullable.group({
    codeCategQ: [''], codeQ: ['', Validators.required],
    vendeurNom: ['', Validators.required], acheteurNom: ['', Validators.required],
    designationBien: ['', Validators.required], prixVente: [0, [Validators.required, Validators.min(0)]],
    dateActe: [new Date().toISOString().slice(0, 10), Validators.required],
    cheminFichier: ['']
  });
  constructor(private fb: FormBuilder, private api: ApiService, private route: ActivatedRoute, private router: Router) {}

  get detailsFiltres() { const c = this.f.value.codeCategQ; return this.details.filter(d => !c || d.codeCategQ === c); }
  get detailChoisi() { return this.details.find(d => d.codeQ === this.f.value.codeQ); }

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
    this.f.valueChanges.pipe(debounceTime(300)).subscribe(v => {
      if (v.codeQ && v.dateActe && (v.prixVente ?? 0) >= 0)
        this.api.calcul(v.codeQ, v.prixVente ?? 0, v.dateActe).subscribe({ next: c => this.calcul = c, error: () => this.calcul = undefined });
      else this.calcul = undefined;
    });
  }

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
    const body = { ...rest, cheminFichier: cheminFichier || null };
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
