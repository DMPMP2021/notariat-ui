import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NotificationService } from '../core/notification.service';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  styles: [`.toast { position: fixed; bottom: 1rem; inset-inline-end: 1rem; max-width: 380px; background: var(--ink); color: #fff; padding: .8rem 1rem; border-radius: var(--radius); z-index: 60; }`],
  template: `
  <app-header />
  <main class="page"><router-outlet /></main>
  <div class="toast" *ngIf="toast" role="status">{{ toast }}</div>`
})
export class LayoutComponent implements OnInit, OnDestroy {
  toast = ''; private t?: any;
  constructor(public notif: NotificationService) {}
  ngOnInit() {
    this.notif.start();
    this.notif.toast$.subscribe(m => { this.toast = m; clearTimeout(this.t); this.t = setTimeout(() => this.toast = '', 6000); });
  }
  ngOnDestroy() { this.notif.stop(); }
}
