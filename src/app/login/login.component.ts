// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { AuthService } from '../core/auth.service';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   template: `
//   <div style="min-height:100vh;display:grid;place-items:center;padding:1rem">
//     <form class="card" style="width:min(380px,100%)" (ngSubmit)="go()">
//       <h1>Connexion</h1>
//       <p style="color:var(--muted);margin-top:0">Espace Notaire, Inspecteur et Receveur.</p>
//       <div class="field"><label for="u">Identifiant</label><input id="u" name="u" [(ngModel)]="u" required autocomplete="username"></div>
//       <div class="field"><label for="p">Mot de passe</label><input id="p" name="p" type="password" [(ngModel)]="p" required autocomplete="current-password"></div>
//       <p class="error" *ngIf="err">{{ err }}</p>
//       <button type="submit" [disabled]="busy" style="width:100%">Se connecter</button>
//     </form>
//   </div>`
// })
// export class LoginComponent {
//   u = ''; p = ''; err = ''; busy = false;
//   constructor(private auth: AuthService, private router: Router) {}
//   go() {
//     this.busy = true; this.err = '';
//     this.auth.login(this.u, this.p).subscribe({
//       next: () => this.router.navigateByUrl(this.auth.homeRoute()),
//       error: e => { this.busy = false; this.err = e.error?.message ?? 'Connexion impossible.'; }
//     });
//   }
// }
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  u = ''; p = ''; err = ''; busy = false; logoOk = true;
  annee = new Date().getFullYear();
  logoSrc = 'assets/img/LogoDGI.png';

  constructor(private auth: AuthService, private router: Router) {}
  go() {
    this.busy = true; this.err = '';
    this.auth.login(this.u, this.p).subscribe({
      next: () => this.router.navigateByUrl(this.auth.homeRoute()),
      error: e => { this.busy = false; this.err = e.error?.message ?? 'Connexion impossible.'; }
    });
  }
}