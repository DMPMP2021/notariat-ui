import { Routes } from '@angular/router';
import { roleGuard } from './core/guards';
import { LayoutComponent } from './shared/layout.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '', component: LayoutComponent,
    children: [
      {
        path: 'notaire', canActivate: [roleGuard('Notaire')],
        children: [
          { path: 'dashboard', loadComponent: () => import('./shared/dashboard.component').then(m => m.DashboardComponent) },
          { path: 'declarations', loadComponent: () => import('./notaire/mes-declarations.component').then(m => m.MesDeclarationsComponent) },
          { path: 'declarations/:id', loadComponent: () => import('./notaire/declaration-form.component').then(m => m.DeclarationFormComponent) },
          { path: 'instance-paiement', loadComponent: () => import('./notaire/instance-paiement.component').then(m => m.InstancePaiementComponent) },
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
        ]
      },
      {
        path: 'inspecteur', canActivate: [roleGuard('Inspecteur')],
        children: [
          { path: 'dashboard', loadComponent: () => import('./shared/dashboard.component').then(m => m.DashboardComponent) },
          { path: 'a-verifier', loadComponent: () => import('./inspecteur/a-verifier.component').then(m => m.AVerifierComponent) },
          { path: 'a-enregistrer', loadComponent: () => import('./inspecteur/a-enregistrer.component').then(m => m.AEnregistrerComponent) },
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
        ]
      },
      {
        path: 'receveur', canActivate: [roleGuard('Receveur')],
        children: [
          { path: 'dashboard', loadComponent: () => import('./shared/dashboard.component').then(m => m.DashboardComponent) },
          { path: 'ordres', loadComponent: () => import('./receveur/ordres.component').then(m => m.OrdresComponent) },
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
        ]
      },
      {
        path: 'verificateur', canActivate: [roleGuard('Verificateur')],
        children: [
          { path: 'dashboard', loadComponent: () => import('./shared/dashboard.component').then(m => m.DashboardComponent) },
          { path: 'a-evaluer', loadComponent: () => import('./verificateur/a-evaluer.component').then(m => m.AEvaluerComponent) },
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
        ]
      }

    ]
  },
  { path: '**', redirectTo: 'login' }
];
