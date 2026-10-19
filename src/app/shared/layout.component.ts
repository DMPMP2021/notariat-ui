import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { NotificationService } from '../core/notification.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  styles: [`
    header { background: var(--brand); color: #fff; }
    .bar { max-width: 1100px; margin: 0 auto; padding: .7rem 1rem; display: flex; align-items: center; gap: 1.2rem; flex-wrap: wrap; }
    .brand { font-family: Georgia, serif; font-size: 1.15rem; margin-right: auto; }
    nav a { color: #fff; text-decoration: none; padding: .3rem .1rem; margin-right: 1rem; border-bottom: 2px solid transparent; }
    nav a.active { border-bottom-color: #fff; }
    .bell { position: relative; }
    .bell > button { background: transparent; border-color: #fff; }
    .count { background: #f0b429; color: #1d2733; border-radius: 999px; padding: 0 .45rem; margin-left: .3rem; font-weight: 700; }
    .panel { position: absolute; right: 0; top: 2.6rem; width: 340px; max-height: 360px; overflow: auto; color: var(--ink); z-index: 20; padding: 0; }
    .panel p { margin: 0; padding: .7rem .9rem; border-bottom: 1px solid var(--line); }
    .panel p.new { background: #eef6f3; }
    .panel small { display: block; color: var(--muted); }
    .toast { position: fixed; bottom: 1rem; right: 1rem; max-width: 380px; background: var(--ink); color: #fff; padding: .8rem 1rem; border-radius: var(--radius); z-index: 60; }
  `],
  template: `
  <header>
    <div class="bar">
      <span class="brand">Gestion des actes notariés</span>
      <nav>
        <ng-container *ngIf="auth.hasRole('Notaire')">
          <a routerLink="/notaire/declarations" routerLinkActive="active">Mes déclarations</a>
          <a routerLink="/notaire/instance-paiement" routerLinkActive="active">Instance de paiement</a>
        </ng-container>
        <ng-container *ngIf="auth.hasRole('Inspecteur')">
          <a routerLink="/inspecteur/a-verifier" routerLinkActive="active">À vérifier</a>
          <a routerLink="/inspecteur/a-enregistrer" routerLinkActive="active">À enregistrer</a>
        </ng-container>
        <ng-container *ngIf="auth.hasRole('Receveur')">
          <a routerLink="/receveur/ordres" routerLinkActive="active">Ordres à encaisser</a>
        </ng-container>
      </nav>
      <div class="bell" *ngIf="notif.items$ | async as items">
        <button (click)="toggle()" aria-label="Notifications">Notifications
          <span class="count" *ngIf="nonLues(items) as n">{{ n }}</span></button>
        <div class="panel card" *ngIf="open">
          <p *ngIf="!items.length">Aucune notification.</p>
          <p *ngFor="let n of items" [class.new]="!n.lue">{{ n.message }}<small>{{ n.dateCreation | date:'dd/MM/yyyy HH:mm' }}</small></p>
        </div>
      </div>
      <span>{{ (auth.user$ | async)?.nom }}</span>
      <button class="ghost" style="color:#fff;border-color:#fff" (click)="logout()">Déconnexion</button>
    </div>
  </header>
  <main class="page container-fluid"><router-outlet /></main>
  <div class="toast" *ngIf="toast" role="status">{{ toast }}</div>
  `
})
export class LayoutComponent implements OnInit, OnDestroy {
  open = false; toast = ''; private t?: any;
  constructor(public auth: AuthService, public notif: NotificationService) {}
  ngOnInit() {
    this.notif.start();
    this.notif.toast$.subscribe(m => { this.toast = m; clearTimeout(this.t); this.t = setTimeout(() => this.toast = '', 6000); });
  }
  ngOnDestroy() { this.notif.stop(); }
  nonLues(l: { lue: boolean }[]) { return l.filter(n => !n.lue).length; }
  toggle() { this.open = !this.open; if (!this.open) this.notif.marquerLues(); }
  logout() { this.notif.stop(); this.auth.logout(); }
}
