// import { Component, OnDestroy, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Subscription } from 'rxjs';
// import { ApiService, DashboardData, Kpi, STATUT_LABELS } from '../core/api.service';
// import { AuthService } from '../core/auth.service';
// import { NotificationService } from '../core/notification.service';

// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   imports: [CommonModule],
//   styles: [`
//     .sub { color: var(--muted); margin: -.4rem 0 1rem; }
//     .kpis { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: .8rem; margin-bottom: 1.5rem; }
//     .kpi { background: var(--card); border: 1px solid var(--line); border-left: 5px solid var(--line); border-radius: var(--radius); padding: .8rem 1rem; }
//     .kpi.t-ok { border-left-color: var(--ok); } .kpi.t-warn { border-left-color: #d69e00; }
//     .kpi.t-danger { border-left-color: var(--danger); } .kpi.t-info { border-left-color: #1f5fa8; }
//     .lbl { display: block; font-size: .85rem; color: var(--muted); }
//     .val { display: block; font-size: 1.7rem; font-family: "Palatino Linotype", Georgia, serif; line-height: 1.3; font-variant-numeric: tabular-nums; }
//     .val small { font-size: .85rem; font-family: system-ui, sans-serif; color: var(--muted); }
//     .hint { font-size: .78rem; color: var(--muted); }
//     .row { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; }
//     @media (max-width: 800px) { .row { grid-template-columns: 1fr; } }
//     .legend { display: flex; gap: 1rem; flex-wrap: wrap; font-size: .85rem; margin-bottom: .6rem; }
//     .legend i { display: inline-block; width: .8rem; height: .8rem; border-radius: 2px; margin-right: .3rem; vertical-align: -1px; }
//     .bars { display: flex; gap: .5rem; align-items: flex-end; }
//     .grp { flex: 1; text-align: center; min-width: 0; }
//     .cols { display: flex; gap: 3px; align-items: flex-end; height: 170px; border-bottom: 1px solid var(--line); }
//     .col { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; height: 100%; align-items: center; min-width: 0; }
//     .bar { width: 100%; border-radius: 3px 3px 0 0; min-height: 0; }
//     .v { font-size: .7rem; color: var(--muted); }
//     .lab { font-size: .75rem; color: var(--muted); display: block; margin-top: .25rem; }
//     .st { display: flex; align-items: center; gap: .5rem; margin: .45rem 0; font-size: .88rem; }
//     .st span.n { width: 2rem; text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; }
//     .track { flex: 1; background: #e6eaee; border-radius: 3px; height: .6rem; }
//     .fill { height: 100%; border-radius: 3px; background: var(--brand); }
//   `],
//   template: `
//   <h1>Tableau de bord</h1>
//   <p class="sub">{{ (auth.user$ | async)?.nom }} · {{ data?.role }}</p>
//   <p class="error" *ngIf="err">{{ err }}</p>

//   <ng-container *ngIf="data">
//     <div class="kpis">
//       <div class="kpi" *ngFor="let k of data.kpis" [ngClass]="'t-' + (k.tone || 'none')">
//         <span class="lbl">{{ k.label }}</span>
//         <strong class="val" [ngSwitch]="k.format">
//           <ng-container *ngSwitchCase="'money'">{{ k.value | number:'1.2-2' }} <small>DA</small></ng-container>
//           <ng-container *ngSwitchCase="'percent'">{{ k.value | number:'1.0-1' }} <small>%</small></ng-container>
//           <ng-container *ngSwitchCase="'days'">{{ k.value | number:'1.0-1' }} <small>jours</small></ng-container>
//           <ng-container *ngSwitchCase="'hours'">{{ k.value | number:'1.0-1' }} <small>heures</small></ng-container>
//           <ng-container *ngSwitchDefault>{{ k.value | number:'1.0-0' }}</ng-container>
//         </strong>
//         <span class="hint" *ngIf="k.hint">{{ k.hint }}</span>
//       </div>
//     </div>

//     <div class="row">
//       <div class="card" *ngIf="data.labels.length">
//         <h2>{{ data.seriesTitle }}</h2>
//         <div class="legend"><span *ngFor="let s of data.series; let i = index"><i [style.background]="colors[i]"></i>{{ s.name }}</span></div>
//         <div class="bars" role="img" [attr.aria-label]="data.seriesTitle">
//           <div class="grp" *ngFor="let l of data.labels; let i = index">
//             <div class="cols">
//               <div class="col" *ngFor="let s of data.series; let j = index" [title]="s.name + ' : ' + s.values[i]">
//                 <span class="v" *ngIf="s.values[i] > 0">{{ s.values[i] | number: data.seriesFormat === 'money' ? '1.0-0' : '1.0-0' }}</span>
//                 <div class="bar" [style.height.%]="h(s.values[i])" [style.background]="colors[j]"></div>
//               </div>
//             </div>
//             <span class="lab">{{ l }}</span>
//           </div>
//         </div>
//       </div>

//       <div class="card" *ngIf="data.statuts.length">
//         <h2>Répartition par statut</h2>
//         <div class="st" *ngFor="let s of data.statuts">
//           <span style="width:9.5rem">{{ label(s.statut) }}</span>
//           <div class="track"><div class="fill" [style.width.%]="pct(s.count)"></div></div>
//           <span class="n">{{ s.count }}</span>
//         </div>
//       </div>
//     </div>
//   </ng-container>`
// })
// export class DashboardComponent implements OnInit, OnDestroy {
//   data?: DashboardData; err = '';
//   colors = ['#0e5a4a', '#a63d2f', '#1f5fa8'];
//   private sub?: Subscription;
//   constructor(private api: ApiService, public auth: AuthService, private notif: NotificationService) {}

//   ngOnInit() { this.charger(); this.sub = this.notif.incoming$.subscribe(() => this.charger()); }
//   ngOnDestroy() { this.sub?.unsubscribe(); }
//   charger() {
//     this.api.dashboard().subscribe({ next: d => this.data = d, error: e => this.err = e.error?.message ?? 'Chargement impossible.' });
//   }
//   private get max() { return Math.max(0, ...(this.data?.series.flatMap(s => s.values) ?? [])); }
//   h(v: number) { return this.max > 0 && v > 0 ? Math.max(3, (v / this.max) * 100) : 0; }
//   label(s: string) { return (STATUT_LABELS as any)[s] ?? s; }
//   pct(n: number) { const t = Math.max(1, ...(this.data?.statuts.map(x => x.count) ?? [1])); return (n / t) * 100; }
// }
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ApiService, DashboardData, STATUT_LABELS } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { NotificationService } from '../core/notification.service';

interface Etape { statut: string; label: string; count: number; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    /* ---- occupe toute la largeur et toute la hauteur disponibles ---- */
    :host { display: flex; flex-direction: column; flex: 1; width: 100%; }
    .grad {
      flex: 1; width: 100%;
      background-image: linear-gradient(120deg, #f6f7f2, #becccb);
      border-radius: .5rem;
      padding: clamp(.8rem, 2vw, 1.5rem);
    }
    .titre { text-align: center; margin-bottom: .2rem; }
    .sub { text-align: center; color: var(--muted); margin: 0 0 1.2rem; }
    .card { border: none; border-radius: .5rem; background: #fff; box-shadow: 0 2px 2px 2px rgba(0, 0, 0, 0.2); }

    /* ---- barre de progression des dossiers ---- */
    .etapes { margin-bottom: 1.2rem; }
    .etapes h2 { text-align: center; }
    .progressbar { display: flex; justify-content: space-between; margin: 0; padding: 0; list-style: none; }
    .progressbar li { flex: 1; position: relative; text-align: center; font-size: 12px; list-style: none; min-width: 0; }
    .progressbar li.active { color: #000; }
    .progressbar li.inactive { color: #777; }
    .pastille {
      display: block; position: relative; z-index: 1;
      width: 40px; height: 40px; line-height: 40px; margin: 0 auto 8px;
      border-radius: 40%; font-size: 16px; font-weight: 700;
      background: burlywood; color: #000;
    }
    .progressbar li.active .pastille { background: #07bd9e; color: #fff; }
    .progressbar li:not(:first-child)::after {
      content: ''; position: absolute; z-index: 0; top: 20px; right: 50%;
      width: 100%; height: 2px; background: lightgray;
    }
    .progressbar li.active:not(:first-child)::after { background: #07bd9e; }
    .rej { text-align: center; color: var(--danger); font-size: .85rem; margin: .8rem 0 0; }

    /* ---- indicateurs : s'étirent pour remplir chaque ligne ---- */
    .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(210px, 100%), 1fr)); gap: .8rem; margin-bottom: 1.2rem; }
    .kpi { background: #fff; border-left: 5px solid #ccc; border-radius: .5rem; padding: .8rem 1rem; box-shadow: 0 2px 2px 2px rgba(0, 0, 0, 0.2); min-width: 0; }
    .kpi.t-ok { border-left-color: #07bd9e; } .kpi.t-warn { border-left-color: #d69e00; }
    .kpi.t-danger { border-left-color: var(--danger); } .kpi.t-info { border-left-color: #1f5fa8; }
    .lbl { display: block; font-size: .85rem; color: var(--muted); }
    .val { display: block; font-size: clamp(1.4rem, 2.2vw, 1.9rem); font-family: "Palatino Linotype", Georgia, serif; line-height: 1.3; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
    .val small { font-size: .85rem; font-family: system-ui, sans-serif; color: var(--muted); }
    .hint { font-size: .78rem; color: var(--muted); }

    /* ---- graphiques ---- */
    .row { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 1rem; }
    .legend { display: flex; gap: 1rem; flex-wrap: wrap; font-size: .85rem; margin-bottom: .6rem; }
    .legend i { display: inline-block; width: .8rem; height: .8rem; border-radius: 2px; margin-right: .3rem; vertical-align: -1px; }
    .bars { display: flex; gap: .5rem; align-items: flex-end; }
    .grp { flex: 1; text-align: center; min-width: 0; }
    .cols { display: flex; gap: 3px; align-items: flex-end; height: clamp(170px, 26vh, 300px); border-bottom: 1px solid var(--line); }
    .col { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; height: 100%; align-items: center; min-width: 0; }
    .bar { width: 100%; border-radius: 3px 3px 0 0; min-height: 0; }
    .v { font-size: .7rem; color: var(--muted); }
    .lab { font-size: .75rem; color: var(--muted); display: block; margin-top: .25rem; }
    .st { display: flex; align-items: center; gap: .5rem; margin: .45rem 0; font-size: .88rem; }
    .st .nom { width: 9.5rem; flex: none; }
    .st span.n { width: 2rem; text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; }
    .track { flex: 1; background: #e6eaee; border-radius: 3px; height: .6rem; }
    .fill { height: 100%; border-radius: 3px; background: #07bd9e; }

    /* ---- tablette et mobile ---- */
    @media (max-width: 900px) { .row { grid-template-columns: 1fr; } }
    @media (max-width: 600px) {
      .grad { padding: .7rem; border-radius: .3rem; }
      .progressbar li { font-size: 10px; }
      .pastille { width: 34px; height: 34px; line-height: 34px; font-size: 14px; }
      .progressbar li:not(:first-child)::after { top: 17px; }
      .st .nom { width: 7rem; }
      .cols { height: 150px; }
    }
  `],
  template: `
  <div class="grad container-fluid">
    <h1 class="titre">Tableau de bord</h1>
    <p class="sub">{{ (auth.user$ | async)?.nom }} · {{ data?.role }}</p>
    <p class="error" *ngIf="err">{{ err }}</p>

    <ng-container *ngIf="data">
      <!-- Avancement des dossiers : une étape par statut -->
      <div class="card etapes" *ngIf="etapes.length">
        <h2>Avancement des dossiers</h2>
        <ul class="progressbar">
          <li *ngFor="let e of etapes" [ngClass]="e.count > 0 ? 'active' : 'inactive'">
            <span class="pastille">{{ e.count }}</span>
            <strong>{{ e.label }}</strong>
          </li>
        </ul>
        <p class="rej" *ngIf="rejetees > 0">{{ rejetees }} dossier(s) rejeté(s) à corriger</p>
      </div>

      <div class="kpis">
        <div class="kpi" *ngFor="let k of data.kpis" [ngClass]="'t-' + (k.tone || 'none')">
          <span class="lbl">{{ k.label }}</span>
          <strong class="val" [ngSwitch]="k.format">
            <ng-container *ngSwitchCase="'money'">{{ k.value | number:'1.2-2' }} <small>DA</small></ng-container>
            <ng-container *ngSwitchCase="'percent'">{{ k.value | number:'1.0-1' }} <small>%</small></ng-container>
            <ng-container *ngSwitchCase="'days'">{{ k.value | number:'1.0-1' }} <small>jours</small></ng-container>
            <ng-container *ngSwitchCase="'hours'">{{ k.value | number:'1.0-1' }} <small>heures</small></ng-container>
            <ng-container *ngSwitchDefault>{{ k.value | number:'1.0-0' }}</ng-container>
          </strong>
          <span class="hint" *ngIf="k.hint">{{ k.hint }}</span>
        </div>
      </div>

      <div class="row">
        <div class="card" *ngIf="data.labels.length" style="padding:1rem">
          <h2>{{ data.seriesTitle }}</h2>
          <div class="legend"><span *ngFor="let s of data.series; let i = index"><i [style.background]="colors[i]"></i>{{ s.name }}</span></div>
          <div class="bars" role="img" [attr.aria-label]="data.seriesTitle">
            <div class="grp" *ngFor="let l of data.labels; let i = index">
              <div class="cols">
                <div class="col" *ngFor="let s of data.series; let j = index" [title]="s.name + ' : ' + s.values[i]">
                  <span class="v" *ngIf="s.values[i] > 0">{{ s.values[i] | number:'1.0-0' }}</span>
                  <div class="bar" [style.height.%]="h(s.values[i])" [style.background]="colors[j]"></div>
                </div>
              </div>
              <span class="lab">{{ l }}</span>
            </div>
          </div>
        </div>

        <div class="card" *ngIf="data.statuts.length" style="padding:1rem">
          <h2>Répartition par statut</h2>
          <div class="st" *ngFor="let s of data.statuts">
            <span class="nom">{{ label(s.statut) }}</span>
            <div class="track"><div class="fill" [style.width.%]="pct(s.count)"></div></div>
            <span class="n">{{ s.count }}</span>
          </div>
        </div>
      </div>
    </ng-container>
  </div>`
})
export class DashboardComponent implements OnInit, OnDestroy {
  data?: DashboardData; err = '';
  etapes: Etape[] = []; rejetees = 0;
  colors = ['#07bd9e', '#a63d2f', '#1f5fa8'];
  private sub?: Subscription;
  private readonly ordre = ['Brouillon', 'Soumise', 'InstancePaiement', 'Payee', 'Enregistree'];
  constructor(private api: ApiService, public auth: AuthService, private notif: NotificationService) {}

  ngOnInit() { this.charger(); this.sub = this.notif.incoming$.subscribe(() => this.charger()); }
  ngOnDestroy() { this.sub?.unsubscribe(); }
  charger() {
    this.api.dashboard().subscribe({
      next: d => { this.data = d; this.calculerEtapes(d); },
      error: e => this.err = e.error?.message ?? 'Chargement impossible.'
    });
  }
  /** Une étape par statut du circuit : verte quand des dossiers s'y trouvent, beige sinon. */
  private calculerEtapes(d: DashboardData) {
    const nb = (s: string) => d.statuts.find(x => x.statut === s)?.count ?? 0;
    this.rejetees = nb('Rejetee');
    this.etapes = d.statuts.length
      ? this.ordre
          .filter(s => !(d.role === 'Inspecteur' && s === 'Brouillon'))
          .map(s => ({ statut: s, label: this.label(s), count: nb(s) }))
      : [];
  }
  private get max() { return Math.max(0, ...(this.data?.series.flatMap(s => s.values) ?? [])); }
  h(v: number) { return this.max > 0 && v > 0 ? Math.max(3, (v / this.max) * 100) : 0; }
  label(s: string) { return (STATUT_LABELS as any)[s] ?? s; }
  pct(n: number) { const t = Math.max(1, ...(this.data?.statuts.map(x => x.count) ?? [1])); return (n / t) * 100; }
}