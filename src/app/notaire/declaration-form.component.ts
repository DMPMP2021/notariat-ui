import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../core/api.service';

@Component({
  selector: 'app-declaration-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <h1>{{ id ? 'Modifier la déclaration' : 'Nouvelle déclaration : acte de vente' }}</h1>
  <form class="card" [formGroup]="f" (ngSubmit)="save(false)">
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

    <p style="color:var(--muted);font-size:.9rem">
      La catégorie de quittance, le taux et les droits sont déterminés par l'inspecteur lors de la vérification de l'acte.
    </p>
    <p class="error" *ngIf="err">{{ err }}</p>
    <div class="actions">
      <button type="submit" class="ghost" [disabled]="f.invalid || busy">Enregistrer le brouillon</button>
      <button type="button" [disabled]="f.invalid || busy" (click)="save(true)">Enregistrer et envoyer à l'inspecteur</button>
    </div>
  </form>`
})
export class DeclarationFormComponent implements OnInit {
  id?: number; err = ''; busy = false; fichierNom = '';
  f = this.fb.nonNullable.group({
    vendeurNom: ['', Validators.required], acheteurNom: ['', Validators.required],
    designationBien: ['', Validators.required], prixVente: [0, [Validators.required, Validators.min(0)]],
    dateActe: [new Date().toISOString().slice(0, 10), Validators.required],
    cheminFichier: ['']
  });
  constructor(private fb: FormBuilder, private api: ApiService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const p = this.route.snapshot.paramMap.get('id');
    if (p && p !== 'nouvelle') {
      this.id = +p;
      this.api.detail(this.id).subscribe(d => {
        this.f.patchValue({ ...d, dateActe: d.dateActe.slice(0, 10), cheminFichier: d.cheminFichier ?? '' });
        this.fichierNom = d.cheminFichier ? 'fichier déjà joint' : '';
      });
    }
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
    const { cheminFichier, ...rest } = this.f.getRawValue();
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
