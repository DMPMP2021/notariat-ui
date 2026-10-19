import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private lang = new BehaviorSubject<string>(localStorage.getItem('lang') ?? 'fr');
  currentLanguage = this.lang.asObservable();
  changeLanguage(l: string) { localStorage.setItem('lang', l); this.lang.next(l); }
}
