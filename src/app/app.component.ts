import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PredictionInput {
  poids: number;
  poids_initial: number;
  ta_systolique: number;
  ta_diastolique: number;
  glycemie_jeune: number;
  glycemie_h1: number;
  glycemie_h2: number;
  hemoglobine: number;
  anemie: boolean;
  sucre_urines: boolean;
  albumine_urines: boolean;
  oedemes: boolean;
  terme_sa: number;
  numero_cpn: number;
  hauteur_uterine: number;
}

interface PredictionResult {
  probability: number;
  risk_level: 'faible' | 'modere' | 'eleve' | 'tres_eleve';
  recommendation: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  formData: PredictionInput = {
    poids: 70,
    poids_initial: 65,
    ta_systolique: 120,
    ta_diastolique: 80,
    glycemie_jeune: 0.9,
    glycemie_h1: 1.5,
    glycemie_h2: 1.2,
    hemoglobine: 12,
    anemie: false,
    sucre_urines: false,
    albumine_urines: false,
    oedemes: false,
    terme_sa: 24,
    numero_cpn: 5,
    hauteur_uterine: 24
  };

  result: PredictionResult | null = null;
  isLoading = false;

  predict() {
    this.isLoading = true;
    setTimeout(() => {
      const score = this.calculateRiskScore();
      this.result = this.interpretScore(score);
      this.isLoading = false;
    }, 800);
  }

  private calculateRiskScore(): number {
    let score = 0;
    
    // Glycémies (facteurs les plus importants)
    if (this.formData.glycemie_jeune >= 0.92) score += 15;
    else if (this.formData.glycemie_jeune >= 0.85) score += 8;
    
    if (this.formData.glycemie_h1 >= 1.80) score += 15;
    else if (this.formData.glycemie_h1 >= 1.65) score += 8;
    
    if (this.formData.glycemie_h2 >= 1.53) score += 10;
    else if (this.formData.glycemie_h2 >= 1.40) score += 5;
    
    // Poids
    const gainPoids = this.formData.poids - this.formData.poids_initial;
    if (this.formData.poids_initial > 85) score += 10;
    else if (this.formData.poids_initial > 75) score += 5;
    
    if (gainPoids > 15) score += 10;
    else if (gainPoids > 12) score += 5;
    
    // Tension artérielle
    if (this.formData.ta_systolique >= 140 || this.formData.ta_diastolique >= 90) {
      score += 15;
    } else if (this.formData.ta_systolique >= 130 || this.formData.ta_diastolique >= 85) {
      score += 8;
    }
    
    if (this.formData.sucre_urines) score += 10;
    if (this.formData.anemie) score += 5;
    if (this.formData.hemoglobine < 10) score += 5;
    if (this.formData.albumine_urines) score += 5;
    if (this.formData.oedemes) score += 5;
    
    return Math.min(score, 100);
  }

  private interpretScore(score: number): PredictionResult {
    if (score >= 60) {
      return {
        probability: Math.min(0.85 + (score - 60) * 0.003, 0.98),
        risk_level: 'tres_eleve',
        recommendation: 'Risque très élevé de diabète gestationnel. Consultation urgente avec un diabétologue recommandée. Un test HGPO doit être réalisé immédiatement.'
      };
    } else if (score >= 40) {
      return {
        probability: 0.50 + (score - 40) * 0.0175,
        risk_level: 'eleve',
        recommendation: 'Risque élevé de diabète gestationnel. Surveillance renforcée recommandée. Régime alimentaire adapté et suivi glycémique régulier conseillés.'
      };
    } else if (score >= 20) {
      return {
        probability: 0.20 + (score - 20) * 0.015,
        risk_level: 'modere',
        recommendation: 'Risque modéré. Continuer le suivi prénatal régulier. Maintenir une alimentation équilibrée et une activité physique adaptée.'
      };
    } else {
      return {
        probability: score * 0.01,
        risk_level: 'faible',
        recommendation: 'Risque faible. Poursuivre les consultations prénatales normales. Maintenir un mode de vie sain.'
      };
    }
  }

  getRiskLevelLabel(level: string): string {
    const labels: { [key: string]: string } = {
      'faible': 'Faible',
      'modere': 'Modéré',
      'eleve': 'Élevé',
      'tres_eleve': 'Très élevé'
    };
    return labels[level] || level;
  }

  getRiskLevelClass(level: string): string {
    const classes: { [key: string]: string } = {
      'faible': 'risk-low',
      'modere': 'risk-moderate',
      'eleve': 'risk-high',
      'tres_eleve': 'risk-very-high'
    };
    return classes[level] || '';
  }

  reset() {
    this.result = null;
    this.formData = {
      poids: 70,
      poids_initial: 65,
      ta_systolique: 120,
      ta_diastolique: 80,
      glycemie_jeune: 0.9,
      glycemie_h1: 1.5,
      glycemie_h2: 1.2,
      hemoglobine: 12,
      anemie: false,
      sucre_urines: false,
      albumine_urines: false,
      oedemes: false,
      terme_sa: 24,
      numero_cpn: 5,
      hauteur_uterine: 24
    };
  }
}
