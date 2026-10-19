import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { font } from '../constants/font';          // même fichier que dans votre projet QUITTANCE (police Amiri en base64)
import { Declaration } from './api.service';

@Injectable({ providedIn: 'root' })
export class PrintOvService {

  FormatDinar(nStr: any): string {
    if (nStr === null || nStr === undefined || nStr === '') return '';
    const x = String(nStr).split('.');
    let x1 = x[0];
    const x2 = x[1];
    const rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) x1 = x1.replace(rgx, '$1 $2');
    return x1 + (x2 ? `,${x2}` : ',00');
  }

  /** Texte arabe pour jsPDF : inverse les parenthèses (non reflétées en RTL) et retire le tatweel. */
  private ar(s: string): string {
    return s.replace(/\u0640/g, '').replace(/[()]/g, c => (c === '(' ? ')' : '('));
  }

  /**
   * Imprime l'ordre de versement au format officiel.
   * @param d déclaration validée (avec ordreVersement)
   * @param libelleFr / libelleAr libellé du droit (table DetailQs)
   */
  imprimer(d: Declaration, lang: 'fr' | 'ar', libelleFr = '', libelleAr = ''): void {
    const ov = d.ordreVersement as any;
    if (!ov) return;

    const numOv = ov.numero ?? '';
    const montant = ov.montant ?? 0;
    const nom = d.notaire?.nomComplet ?? '';
    const adresse = '................................................................................';
    const libelle = lang === 'ar' ? (libelleAr || libelleFr) : (libelleFr || libelleAr);
    const dateOv = ov.dateGeneration ? new Date(ov.dateGeneration) : new Date();
    const annee = dateOv.getFullYear();
    const dateJour = dateOv.toLocaleDateString('fr-DZ');
    const detail = `${this.FormatDinar(d.prix)} + ${this.FormatDinar(d.penalite)}`;

    const fontName = 'Amiri-Bold';
    const doc = new jsPDF('p', 'mm', 'a4');
    const b64 = (font ?? '').replace(/^data:.*;base64,/, '');
    if (b64.length > 1000) {
      doc.addFileToVFS(`${fontName}.ttf`, b64);
      doc.addFont(`${fontName}.ttf`, fontName, 'normal');
      doc.setFont(fontName);
    } else {
      console.warn('constants/font.ts est vide ou invalide.');
      if (lang === 'ar') { alert("Police arabe manquante : copiez constants/font.ts de votre projet QUITTANCE."); return; }
      doc.setFont('helvetica');
    }

    if (lang === 'ar') {
      doc.setLanguage('ar');
      (doc as any).textDirection = 'rtl';
      const text = (t: string, x: number, y: number, o?: any) => doc.text(this.ar(t), x, y, o);

      doc.setFontSize(10);
      text('الجمهورية الجزائرية الديمقراطية الشعبية', 105, 15, { align: 'center' });
      text('وزارة المالية - المديرية العامة للضرائب', 105, 22, { align: 'center' });
      text('ولاية: ........................', 190, 32, { align: 'right' });
      text('مفتشية الضرائب بـ: ........................', 190, 40, { align: 'right' });

      doc.setFontSize(14);
      text('أمر بالتحصيل / حقوق التسجيل والطابع', 105, 55, { align: 'center' });

      doc.setFontSize(11);
      let y = 75;
      text(`رقم: ${numOv} / ${annee}`, 190, y, { align: 'right' });
      y += 15; text(`السيد (ة): ${nom}`, 190, y, { align: 'right' });
      y += 12; text(`المقيم بـ: ${adresse}`, 190, y, { align: 'right' });
      y += 15; text('مطالب (ة) بأن يدفع (تدفع) لدى قابض الضرائب بـ: ........................................................', 190, y, { align: 'right' });
      y += 15; text(`مبلغ وقدره: ${this.FormatDinar(montant)} دج`, 190, y, { align: 'right' });
      y += 10; doc.setFontSize(9); text(`(الحقوق + الغرامة: ${detail} دج)`, 190, y, { align: 'right' }); doc.setFontSize(11);
      y += 15; text(`عن عنوان (البيان): ${libelle}`, 190, y, { align: 'right' });
      y += 12; text(`مرجع العقد: ${d.reference}`, 190, y, { align: 'right' });
      y += 15; text('الحساب المخصص: ........................ رقم العملية: ........................ السطر: ........................', 190, y, { align: 'right' });
      y += 30; text('حرر بـ ........................ في: ' + dateJour, 80, y, { align: 'right' });
      y += 15; text('رئيس المفتشية', 70, y, { align: 'right' });
    } else {
      doc.setFontSize(9);
      doc.text('Imp- Off- Algérie', 20, 12);

      doc.setFontSize(10);
      doc.text('DE LA WILAYA DE : ........................................', 20, 22);
      doc.text('DE : ........................................', 130, 22);
      doc.text('INSPECTION DES IMPOTS DE : ........................................', 20, 30);
      doc.text("DROITS D'ENREGISTREMENT ET DE TIMBRE", 120, 30);

      doc.setFontSize(14);
      doc.text('ORDRE DE VERSEMENT', 105, 45, { align: 'center' });

      doc.setFontSize(11);
      let y = 62;
      doc.text(`N° : ${numOv} / ${annee}`, 20, y);
      y += 12; doc.text(`M : ${nom}`, 20, y);
      y += 10; doc.text(`Demeurant à : ${adresse}`, 20, y);
      y += 15; doc.text('Est prié de verser à la Caisse du Receveur des Impôts de : ..............................................................', 20, y);
      y += 12; doc.text(`La somme de : ${this.FormatDinar(montant)} D.A.`, 20, y);
      y += 8;  doc.setFontSize(9); doc.text(`(droits ${this.FormatDinar(d.prix)} D.A. + pénalité ${this.FormatDinar(d.penalite)} D.A.)`, 20, y); doc.setFontSize(11);
      y += 12; doc.text(`Au titre de : ${libelle}`, 20, y);
      y += 10; doc.text(`Référence de l'acte : ${d.reference}  (${d.vendeurNom} / ${d.acheteurNom})`, 20, y);
      y += 15; doc.text('A Imputer au Compte : .............................. Opération N° : ................ Ligne : ................', 20, y);
      y += 30; doc.text('A ........................................ le ' + dateJour, 120, y);
      y += 15; doc.text("Le Chef d'Inspection,", 140, y);
    }

    try {
      const url = URL.createObjectURL(doc.output('blob'));
      const win = window.open(url, '_blank');
      if (!win) alert("Veuillez autoriser les pop-ups pour afficher l'ordre de versement.");
    } catch (e) {
      console.error('Erreur lors de la génération du PDF :', e);
    }
  }
}
