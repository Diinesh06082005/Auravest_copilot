import fs from 'fs';
import path from 'path';
import { logger } from '../../shared/logger';
import { FinancialFeatures, TrainedModelWeights, trainFinQuantModel } from '../ml/trainFinancialModel';

export interface MLInferenceResult {
  modelName: string;
  version: string;
  predictedQuantScore: number; // 0 - 100
  financialGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
  bankruptcyProbability: number; // Percentage 0% - 100%
  keyModelDrivers: string[];
}

export class CustomModelService {
  private weights: TrainedModelWeights | null = null;

  constructor() {
    this.loadOrTrainModel();
  }

  /**
   * Load trained model weights from disk or train if missing.
   */
  private loadOrTrainModel(): void {
    const modelFilePath = path.join(__dirname, '../ml/models/finquant_model.json');

    try {
      if (fs.existsSync(modelFilePath)) {
        const raw = fs.readFileSync(modelFilePath, 'utf-8');
        this.weights = JSON.parse(raw) as TrainedModelWeights;
        logger.info(`[CustomMLModel] Successfully loaded pre-trained model "${this.weights.version}" (Trained at ${this.weights.trainedAt}).`);
      } else {
        logger.info('[CustomMLModel] Model file not found. Initiating model training pipeline...');
        this.weights = trainFinQuantModel();
      }
    } catch (err: any) {
      logger.warn(`[CustomMLModel] Error loading model file. Retraining... (${err.message})`);
      this.weights = trainFinQuantModel();
    }
  }

  /**
   * Run inference on financial metrics using the custom trained ML model.
   */
  public predict(features: Partial<FinancialFeatures>): MLInferenceResult {
    if (!this.weights) {
      this.loadOrTrainModel();
    }

    const w = this.weights!.weights;
    const t = this.weights!.classificationThresholds;

    // Default safe fallbacks if feature missing
    const pe = features.peRatio ?? 20;
    const pb = features.pbRatio ?? 2.5;
    const debt = features.debtToEquity ?? 1.2;
    const margin = features.profitMargin ?? 0.12;
    const growth = features.revenueGrowth ?? 0.10;
    const beta = features.beta ?? 1.1;
    const sentiment = features.sentimentScore ?? 0.2;

    // Linear Regression Inference Score Calculation
    let rawScore =
      pe * w.pe +
      pb * w.pb +
      debt * w.debt +
      margin * w.margin +
      growth * w.growth +
      beta * w.beta +
      sentiment * w.sentiment +
      w.bias;

    // Normalize predicted score between 10 and 99
    const score = Math.max(10, Math.min(99, Math.round(rawScore)));

    // Classify Financial Health Grade
    let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'D';
    if (score >= t.APlus) grade = 'A+';
    else if (score >= t.A) grade = 'A';
    else if (score >= t.B) grade = 'B';
    else if (score >= t.C) grade = 'C';

    // Calculate Bankruptcy Probability (Sigmoid transformation of Risk Drivers)
    const riskFactor = (debt * 0.4) - (margin * 2.0) - (growth * 1.5) + (beta * 0.2);
    const bankruptcyProb = Math.max(0.5, Math.min(85.0, Number((100 / (1 + Math.exp(-riskFactor + 1.2))).toFixed(1))));

    // Determine Top Model Drivers
    const drivers: string[] = [];
    if (margin > 0.20) drivers.push('Strong Profitability Margin (+)');
    else if (margin < 0.05) drivers.push('Low Profitability Margin (-)');

    if (growth > 0.15) drivers.push('High Revenue Growth Trend (+)');
    else if (growth < 0) drivers.push('Negative Revenue Growth (-)');

    if (debt > 2.5) drivers.push('Elevated Debt Load (-)');
    else if (debt < 0.8) drivers.push('Healthy Balance Sheet (- Debt)');

    if (sentiment > 0.3) drivers.push('Positive News Sentiment (+)');
    else if (sentiment < -0.2) drivers.push('Negative News Sentiment (-)');

    return {
      modelName: 'Auravest-FinQuant ML Classifier',
      version: this.weights!.version,
      predictedQuantScore: score,
      financialGrade: grade,
      bankruptcyProbability: bankruptcyProb,
      keyModelDrivers: drivers,
    };
  }
}

export const customModelService = new CustomModelService();
