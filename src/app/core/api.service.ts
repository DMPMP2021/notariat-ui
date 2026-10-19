// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../../environments/environment';

// export type Statut = 'Brouillon' | 'Soumise' | 'Rejetee' | 'InstancePaiement' | 'Payee' | 'Enregistree';

// export interface Declaration {
//   id: number; reference: string; typeActe: string; vendeurNom: string; acheteurNom: string;
//   designationBien: string; prixVente: number; dateActe: string; statut: Statut;
//   codeQ?: string; prix: number; penalite: number; cheminFichier?: string;
//   motifRejet?: string; numeroEnregistrement?: string; notaire?: { nomComplet: string };
//   ordreVersement?: { id: number; numero: string; montant: number; estPaye: boolean; dateGeneration?: string;
//     paiement?: { numeroQuittance: string; fichierQuittance?: string; datePaiement: string } };
// }
// export interface Categorie { codeCategQ: string; libelleCategQFr: string; libelleCategQAr: string; }
// export interface DetailQ { codeQ: string; codeCategQ: string; libelleQFr: string; libelleQAr: string; taux: number; tarif: number; }
// export interface Calcul { prix: number; penalite: number; total: number; moisRetard: number; penalitePct: number; }
// export interface Kpi { key: string; label: string; value: number; format: 'number' | 'money' | 'percent' | 'days' | 'hours'; hint?: string; tone?: 'ok' | 'warn' | 'danger' | 'info' | null; }
// export interface DashboardData {
//   role: string; kpis: Kpi[]; statuts: { statut: Statut; count: number }[];
//   seriesTitle: string; seriesFormat: 'number' | 'money'; labels: string[]; series: { name: string; values: number[] }[];
// }
// export interface PaiementRow {
//   id: number; numeroQuittance: string; datePaiement: string; fichierQuittance?: string;
//   ordreVersement: { id: number; numero: string; montant: number; declaration: Declaration };
// }
// export interface Ordre {
//   id: number; numero: string; montant: number; dateGeneration: string;
//   declaration: Declaration;
// }

// export const STATUT_LABELS: Record<Statut, string> = {
//   Brouillon: 'Brouillon', Soumise: 'À vérifier', Rejetee: 'Rejetée',
//   InstancePaiement: 'Instance de paiement', Payee: 'Payée, à enregistrer', Enregistree: 'Enregistrée'
// };

// @Injectable({ providedIn: 'root' })
// export class ApiService {
//   private url = `${environment.apiUrl}/declarations`;
//   constructor(private http: HttpClient) {}

//   // Notaire
//   creer(d: any) { return this.http.post<Declaration>(this.url, d); }
//   modifier(id: number, d: any) { return this.http.put<Declaration>(`${this.url}/${id}`, d); }
//   soumettre(id: number) { return this.http.post(`${this.url}/${id}/soumettre`, {}); }
//   mes(statut?: Statut) { return this.http.get<Declaration[]>(`${this.url}/mes-declarations`, { params: statut ? { statut } : {} }); }
//   detail(id: number) { return this.http.get<Declaration>(`${this.url}/${id}`); }
//   dashboard() { return this.http.get<DashboardData>(`${environment.apiUrl}/dashboard`); }
//   categories() { return this.http.get<Categorie[]>(`${environment.apiUrl}/CategorieQ`); }
//   details() { return this.http.get<DetailQ[]>(`${environment.apiUrl}/DetailQ`); }
//   calcul(codeQ: string, montant: number, dateSign: string) {
//     return this.http.get<Calcul>(`${this.url}/calcul`, { params: { codeQ, montant, dateSign } });
//   }
//   upload(file: File) {
//     const fd = new FormData(); fd.append('file', file);
//     return this.http.post<{ fileName: string }>(`${this.url}/upload`, fd);
//   }
//   fichier(d: Declaration) { this.telecharger(`${d.id}/fichier`, `${d.reference}${(d.cheminFichier ?? '').slice((d.cheminFichier ?? '').lastIndexOf('.'))}`); }
//   // Inspecteur
//   aVerifier() { return this.http.get<Declaration[]>(`${this.url}/a-verifier`); }
//   aEnregistrer() { return this.http.get<Declaration[]>(`${this.url}/a-enregistrer`); }
//   valider(id: number, codeQ: string) { return this.http.post(`${this.url}/${id}/valider`, { codeQ }); }
//   rejeter(id: number, motif: string) { return this.http.post(`${this.url}/${id}/rejeter`, { motif }); }
//   enregistrer(id: number) { return this.http.post<{ numeroEnregistrement: string }>(`${this.url}/${id}/enregistrer`, {}); }
//   // Receveur
//   ordresAPayer() { return this.http.get<Ordre[]>(`${this.url}/ordres-a-payer`); }
//   payer(ordreId: number, numeroQuittance: string, fichierQuittance?: string) { return this.http.post<{ numeroQuittance: string }>(`${this.url}/ordres/${ordreId}/payer`, { numeroQuittance, fichierQuittance }); }
//   modifierQuittance(ordreId: number, numeroQuittance: string, fichierQuittance?: string) { return this.http.put<{ numeroQuittance: string }>(`${this.url}/ordres/${ordreId}/quittance`, { numeroQuittance, fichierQuittance }); }
//   uploadQuittance(file: File) {
//     const fd = new FormData(); fd.append('file', file);
//     return this.http.post<{ fileName: string }>(`${this.url}/quittance/upload`, fd);
//   }
//   /** Télécharge le PDF joint par le receveur s'il existe, sinon la quittance générée par l'application. */
//   telechargerQuittance(ordreId: number, nom: string, aFichier: boolean) {
//     aFichier ? this.telecharger(`ordres/${ordreId}/quittance/fichier`, `${nom}.pdf`) : this.quittancePdf(ordreId, nom);
//   }
//   paiementsEffectues() { return this.http.get<PaiementRow[]>(`${this.url}/paiements-effectues`); }

//   telecharger(path: string, nomFichier: string) {
//     this.http.get(`${this.url}/${path}`, { responseType: 'blob' }).subscribe(blob => {
//       const a = document.createElement('a');
//       a.href = URL.createObjectURL(blob);
//       a.download = nomFichier;
//       a.click();
//       URL.revokeObjectURL(a.href);
//     });
//   }
//   ordrePdf(d: Declaration) { this.telecharger(`${d.id}/ordre-versement/pdf`, `${d.ordreVersement!.numero}.pdf`); }
//   quittancePdf(ordreId: number, nom: string) { this.telecharger(`ordres/${ordreId}/quittance/pdf`, `${nom}.pdf`); }
// }
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type Statut = 'Brouillon' | 'Soumise' | 'Rejetee' | 'InstancePaiement' | 'Payee' | 'Enregistree';

export interface Declaration {
  id: number; reference: string; typeActe: string; vendeurNom: string; acheteurNom: string;
  designationBien: string; prixVente: number; dateActe: string; statut: Statut;
  codeQ?: string; prix: number; penalite: number; montantRetenu?: number; cheminFichier?: string; evaluation?: Evaluation | null;
  motifRejet?: string; numeroEnregistrement?: string; notaire?: { nomComplet: string };
  ordreVersement?: { id: number; numero: string; montant: number; estPaye: boolean; dateGeneration?: string;
    paiement?: { numeroQuittance: string; fichierQuittance?: string; datePaiement: string } };
}
export type Conclusion = 'Conforme' | 'SousEvalue' | 'SurEvalue';
export interface Evaluation {
  id: number; declarationId: number; verificateurNom?: string;
  montantReference: number; montantDeclare: number; ecart: number; ecartPourcent: number;
  conclusion: Conclusion; observation?: string; dateEvaluation: string;
}
export const CONCLUSION_LABELS: Record<Conclusion, string> = {
  Conforme: 'Conforme', SousEvalue: 'Sous-évalué', SurEvalue: 'Supérieur à la référence'
};
export interface Categorie { codeCategQ: string; libelleCategQFr: string; libelleCategQAr: string; }
export interface DetailQ { codeQ: string; codeCategQ: string; libelleQFr: string; libelleQAr: string; taux: number; tarif: number; }
export interface Calcul { prix: number; penalite: number; total: number; moisRetard: number; penalitePct: number; }
export interface Kpi { key: string; label: string; value: number; format: 'number' | 'money' | 'percent' | 'days' | 'hours'; hint?: string; tone?: 'ok' | 'warn' | 'danger' | 'info' | null; }
export interface DashboardData {
  role: string; kpis: Kpi[]; statuts: { statut: Statut; count: number }[];
  seriesTitle: string; seriesFormat: 'number' | 'money'; labels: string[]; series: { name: string; values: number[] }[];
}
export interface PaiementRow {
  id: number; numeroQuittance: string; datePaiement: string; fichierQuittance?: string;
  ordreVersement: { id: number; numero: string; montant: number; declaration: Declaration };
}
export interface Ordre {
  id: number; numero: string; montant: number; dateGeneration: string;
  declaration: Declaration;
}

export const STATUT_LABELS: Record<Statut, string> = {
  Brouillon: 'Brouillon', Soumise: 'À vérifier', Rejetee: 'Rejetée',
  InstancePaiement: 'Instance de paiement', Payee: 'Payée, à enregistrer', Enregistree: 'Enregistrée'
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private url = `${environment.apiUrl}/declarations`;
  constructor(private http: HttpClient) {}

  // Notaire
  creer(d: any) { return this.http.post<Declaration>(this.url, d); }
  modifier(id: number, d: any) { return this.http.put<Declaration>(`${this.url}/${id}`, d); }
  soumettre(id: number) { return this.http.post(`${this.url}/${id}/soumettre`, {}); }
  mes(statut?: Statut) { return this.http.get<Declaration[]>(`${this.url}/mes-declarations`, { params: statut ? { statut } : {} }); }
  detail(id: number) { return this.http.get<Declaration>(`${this.url}/${id}`); }
  dashboard() { return this.http.get<DashboardData>(`${environment.apiUrl}/dashboard`); }
  categories() { return this.http.get<Categorie[]>(`${environment.apiUrl}/CategorieQ`); }
  details() { return this.http.get<DetailQ[]>(`${environment.apiUrl}/DetailQ`); }
  calcul(codeQ: string, montant: number, dateSign: string) {
    return this.http.get<Calcul>(`${this.url}/calcul`, { params: { codeQ, montant, dateSign } });
  }
  upload(file: File) {
    const fd = new FormData(); fd.append('file', file);
    return this.http.post<{ fileName: string }>(`${this.url}/upload`, fd);
  }
  fichier(d: Declaration) { this.telecharger(`${d.id}/fichier`, `${d.reference}${(d.cheminFichier ?? '').slice((d.cheminFichier ?? '').lastIndexOf('.'))}`); }
  // Inspecteur
  aVerifier() { return this.http.get<Declaration[]>(`${this.url}/a-verifier`); }
  aEnregistrer() { return this.http.get<Declaration[]>(`${this.url}/a-enregistrer`); }
  valider(id: number, codeQ: string, utiliserReference = false) { return this.http.post(`${this.url}/${id}/valider`, { codeQ, utiliserReference }); }
  // Vérificateur
  aEvaluer() { return this.http.get<Declaration[]>(`${this.url}/a-evaluer`); }
  evaluer(id: number, montantReference: number, observation: string) { return this.http.post<Evaluation>(`${this.url}/${id}/evaluer`, { montantReference, observation }); }
  tolerance() { return this.http.get<{ tolerancePourcent: number }>(`${this.url}/evaluation/tolerance`); }
  rejeter(id: number, motif: string) { return this.http.post(`${this.url}/${id}/rejeter`, { motif }); }
  enregistrer(id: number) { return this.http.post<{ numeroEnregistrement: string }>(`${this.url}/${id}/enregistrer`, {}); }
  // Receveur
  ordresAPayer() { return this.http.get<Ordre[]>(`${this.url}/ordres-a-payer`); }
  payer(ordreId: number, numeroQuittance: string, fichierQuittance?: string) { return this.http.post<{ numeroQuittance: string }>(`${this.url}/ordres/${ordreId}/payer`, { numeroQuittance, fichierQuittance }); }
  modifierQuittance(ordreId: number, numeroQuittance: string, fichierQuittance?: string) { return this.http.put<{ numeroQuittance: string }>(`${this.url}/ordres/${ordreId}/quittance`, { numeroQuittance, fichierQuittance }); }
  uploadQuittance(file: File) {
    const fd = new FormData(); fd.append('file', file);
    return this.http.post<{ fileName: string }>(`${this.url}/quittance/upload`, fd);
  }
  /** Télécharge le PDF joint par le receveur s'il existe, sinon la quittance générée par l'application. */
  telechargerQuittance(ordreId: number, nom: string, aFichier: boolean) {
    aFichier ? this.telecharger(`ordres/${ordreId}/quittance/fichier`, `${nom}.pdf`) : this.quittancePdf(ordreId, nom);
  }
  paiementsEffectues() { return this.http.get<PaiementRow[]>(`${this.url}/paiements-effectues`); }

  telecharger(path: string, nomFichier: string) {
    this.http.get(`${this.url}/${path}`, { responseType: 'blob' }).subscribe(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = nomFichier;
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }
  ordrePdf(d: Declaration) { this.telecharger(`${d.id}/ordre-versement/pdf`, `${d.ordreVersement!.numero}.pdf`); }
  quittancePdf(ordreId: number, nom: string) { this.telecharger(`ordres/${ordreId}/quittance/pdf`, `${nom}.pdf`); }

  tous(statut?: Statut) { return this.http.get<Declaration[]>(`${this.url}/tous`, { params: statut ? { statut } : {} }); }
}
