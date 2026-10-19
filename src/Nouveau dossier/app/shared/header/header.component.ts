import { Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, filter } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/auth.service';
import { LanguageService } from '../../core/language.service';
import { NotificationService } from '../../core/notification.service';
import { SearchService } from '../../core/search.service';

interface Lien { path: string; key: string; }

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  logoSrc = 'assets/img/Logofr.png';
  logoOk = true;
  email = 'contact.dgi@mf.gov.dz';
  phone = '+213 21 59 52 52';
  terme = '';
  menuOpen = false;
  bellOpen = false;
  langNames: Record<string, string> = { fr: 'Français', ar: 'العربية', en: 'English' };
  private subs = new Subscription();

  constructor(
    public translate: TranslateService,
    private languageService: LanguageService,
    public auth: AuthService,
    public notif: NotificationService,
    private search: SearchService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {
    // Langues supportées
    translate.addLangs(['fr', 'ar', 'en']);
    translate.setDefaultLang('fr');
  }

  ngOnInit(): void {
    // Écoute les changements de langue
    this.subs.add(this.languageService.currentLanguage.subscribe(lang => {
      this.translate.use(lang);
      this.document.documentElement.dir = lang === 'fr' || lang === 'en' ? 'ltr' : 'rtl';
      this.document.documentElement.lang = lang;
      this.setLogo(lang);
    }));
    // La recherche et les menus se réinitialisent à chaque changement de page
    this.subs.add(this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.terme = ''; this.search.term = ''; this.menuOpen = false;
    }));
  }
  ngOnDestroy(): void { this.subs.unsubscribe(); }

  // ----- rôle / navigation -----
  get role(): string { return this.auth.user$.value?.roles[0] ?? ''; }
  get home(): string { return this.auth.homeRoute() + '/dashboard'; }
  get liens(): Lien[] {
    switch (this.role) {
      case 'Notaire': return [
        { path: '/notaire/declarations', key: 'NAV.MY_DECL' },
        { path: '/notaire/declarations/nouvelle', key: 'NAV.NEW_DECL' },
        { path: '/notaire/instance-paiement', key: 'NAV.PAYMENT' }];
      case 'Inspecteur': return [
        { path: '/inspecteur/a-verifier', key: 'NAV.TO_CHECK' },
        { path: '/inspecteur/a-enregistrer', key: 'NAV.TO_REGISTER' }];
      case 'Receveur': return [{ path: '/receveur/ordres', key: 'NAV.ORDERS' }];
      default: return [];
    }
  }

  // ----- recherche -----
  onSearch() { this.search.term = this.terme; }

  // ----- menus -----
  toggleMenu(e: Event) { e.preventDefault(); e.stopPropagation(); this.menuOpen = !this.menuOpen; this.bellOpen = false; }
  toggleBell(e: Event) {
    e.stopPropagation();
    this.bellOpen = !this.bellOpen; this.menuOpen = false;
    if (!this.bellOpen) this.notif.marquerLues();
  }
  @HostListener('document:click') fermer() { this.menuOpen = false; if (this.bellOpen) { this.bellOpen = false; this.notif.marquerLues(); } }
  nonLues(l: { lue: boolean }[]) { return l.filter(n => !n.lue).length; }
  logout() { this.notif.stop(); this.auth.logout(); }

  /** 🟢 Changer la langue */
  switchLangage(lang: string) {
    this.translate.use(lang);
    this.document.documentElement.dir = lang === 'fr' || lang === 'en' ? 'ltr' : 'rtl';
    this.languageService.changeLanguage(lang);
    this.showKeyboardLanguageNotification(lang);

    // Émettre un événement global pour d'autres composants
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: this.translate.currentLang } }));
  }

  /** 🟢 Changer le logo selon la langue */
  private setLogo(lang: string) { this.logoSrc = `assets/img/Logo${lang}.png`; this.logoOk = true; }

  /** 🟢 Message pour le changement de langue du clavier */
  private showKeyboardLanguageNotification(lang: string) {
    const messages: Record<string, string> = {
      fr: 'S.V.P. changez votre clavier en français.',
      en: 'Please change your keyboard to English.',
      ar: 'يرجى تغيير لوحة المفاتيح إلى اللغة العربية.'
    };
    Swal.fire({
      toast: true, position: 'bottom-left', icon: 'info', title: messages[lang] ?? '',
      showConfirmButton: true, confirmButtonColor: '#d33', timer: 6000,
      background: '#fff', color: '#000', iconColor: '#00aaff'
    });
  }
}
