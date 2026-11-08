import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService, Notif } from '../core/notification.service';
import { AuthService } from '../core/auth.service'; // <--- Importez AuthService

@Component({
  selector: 'app-notification-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-menu.component.html',
  styleUrls: ['./notification-menu.component.scss']
})
export class NotificationMenuComponent implements OnInit, OnDestroy {
  notifications: Notif[] = [];
  isOpen = false;
  unreadCount = 0;
  private sub = new Subscription();

  constructor(
    public notifService: NotificationService,
    private router: Router,
    private auth: AuthService // <--- Injectez AuthService ici
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.notifService.items$.subscribe(items => {
        this.notifications = items;
        this.unreadCount = items.filter(n => !n.lue).length;
      })
    );
  }

  toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  closeMenu(): void {
    this.isOpen = false;
  }

  markAllAsRead(): void {
    this.notifService.marquerLues();
  }

  // Clic sur une notification spécifique avec gestion dynamique selon le rôle
  onNotifClick(notif: Notif): void {
    if (notif.declarationId) {
      // Redirection dynamique basée sur le rôle de l'utilisateur connecté
      if (this.auth.hasRole('Notaire')) {
        this.router.navigate(['/notaire/declarations', notif.declarationId]);
      } else if (this.auth.hasRole('Inspecteur')) {
        // Adaptez selon votre route exacte pour l'inspecteur (ex: /inspecteur/a-verifier ou autre)
        this.router.navigate(['/inspecteur/a-verifier', notif.declarationId]);
      } else if (this.auth.hasRole('Receveur')) {
        this.router.navigate(['/receveur/ordres', notif.declarationId]);
      } else if (this.auth.hasRole('Verificateur')) {
        this.router.navigate(['/verificateur/a-evaluer', notif.declarationId]);
      } else {
        // Route par défaut de secours
        this.router.navigate(['/declarations', notif.declarationId]);
      }
    }

    if (!notif.lue) {
      notif.lue = true;
    }

    this.isOpen = false;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}