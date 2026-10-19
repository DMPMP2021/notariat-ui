// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { BehaviorSubject, tap } from 'rxjs';
// import { environment } from '../../environments/environment';

// export interface SessionUser { nom: string; roles: string[]; }

// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   user$ = new BehaviorSubject<SessionUser | null>(JSON.parse(localStorage.getItem('user') ?? 'null'));
//   constructor(private http: HttpClient, private router: Router) {}

//   login(userName: string, password: string) {
//     return this.http.post<any>(`${environment.apiUrl}/auth/login`, { userName, password }).pipe(
//       tap(r => {
//         localStorage.setItem('token', r.token);
//         localStorage.setItem('user', JSON.stringify({ nom: r.nom, roles: r.roles }));
//         this.user$.next({ nom: r.nom, roles: r.roles });
//       }));
//   }
//   logout() { localStorage.clear(); this.user$.next(null); this.router.navigate(['/login']); }
//   get token() { return localStorage.getItem('token'); }
//   hasRole(role: string) { return this.user$.value?.roles.includes(role) ?? false; }
//   homeRoute() {
//     if (this.hasRole('Notaire')) return '/notaire';
//     if (this.hasRole('Inspecteur')) return '/inspecteur';
//     if (this.hasRole('Receveur')) return '/receveur';
//     return '/login';
//   }
// }
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SessionUser { nom: string; roles: string[]; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  user$ = new BehaviorSubject<SessionUser | null>(JSON.parse(localStorage.getItem('user') ?? 'null'));
  constructor(private http: HttpClient, private router: Router) {}

  login(userName: string, password: string) {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, { userName, password }).pipe(
      tap(r => {
        localStorage.setItem('token', r.token);
        localStorage.setItem('user', JSON.stringify({ nom: r.nom, roles: r.roles }));
        this.user$.next({ nom: r.nom, roles: r.roles });
      }));
  }
  logout() { localStorage.clear(); this.user$.next(null); this.router.navigate(['/login']); }
  get token() { return localStorage.getItem('token'); }
  hasRole(role: string) { return this.user$.value?.roles.includes(role) ?? false; }
  homeRoute() {
    if (this.hasRole('Notaire')) return '/notaire';
    if (this.hasRole('Inspecteur')) return '/inspecteur';
    if (this.hasRole('Receveur')) return '/receveur';
    if (this.hasRole('Verificateur')) return '/verificateur';
    return '/login';
  }
}
