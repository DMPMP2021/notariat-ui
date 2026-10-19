import { Injectable, Pipe, PipeTransform } from '@angular/core';

/** Terme saisi dans la barre de recherche de l'en-tête. */
@Injectable({ providedIn: 'root' })
export class SearchService { term = ''; }

/** Filtre n'importe quelle liste sur le terme de recherche (référence, noms, n° d'ordre...). */
@Pipe({ name: 'recherche', standalone: true, pure: false })
export class RecherchePipe implements PipeTransform {
  constructor(private s: SearchService) {}
  transform<T>(list: T[] | null | undefined): T[] {
    const l = list ?? [];
    const t = this.s.term.trim().toLowerCase();
    return t ? l.filter(x => JSON.stringify(x).toLowerCase().includes(t)) : l;
  }
}
