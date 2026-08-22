import fs from 'fs';
import path from 'path';

export interface FinancialFeatures {
  peRatio: number;
  pbRatio: number;
  debtToEquity: number;
  profitMargin: number; // e.g. 0.15 = 15%
  revenueGrowth: number; // e.g. 0.20 = 20%
  beta: number;
  sentimentScore: number; // -1.0 to 1.0
}

export interface TrainedModelWeights {
  version: string;
  trainedAt: string;
  sampleCount: number;
  weights: {
    pe: number;
    pb: number;
    debt: number;
    margin: number;
    growth: number;
    beta: number;
    sentiment: number;
    bias: number;
  };
  classificationThresholds: {
    APlus: number;
    A: number;
    B: number;
    C: number;
  };
}

/**
 * Historical Training Dataset Generator
 * Simulates thousands of financial metrics labeled with institutional health outcomes.
 */
function generateDataset(samples = 1500) {
  const data: { features: FinancialFeatures; targetScore: number }[] = [];

  for (let i = 0; i < samples; i++) {
    // Generate realistic ranges
    const peRatio = Math.max(2, Math.random() * 80);
    const pbRatio = Math.max(0.5, Math.random() * 20);
    const debtToEquity = Math.max(0, Math.random() * 5);
    const profitMargin = (Math.random() - 0.2) * 0.5; // -10% to +30%
    const revenueGrowth = (Math.random() - 0.15) * 0.6; // -15% to +45%
    const beta = 0.5 + Math.random() * 2.0;
    const sentimentScore = (Math.random() - 0.5) * 2.0;

    // Ground Truth Scoring Formula based on financial risk theory
    let target = 50;
    
    // Profitability & Growth (+ weights)
    target += profitMargin * 80;
    target += revenueGrowth * 70;
    target += sentimentScore * 15;

    // Debt & Volatility (- risk penalties)
    target -= debtToEquity * 8;
    target -= (beta - 1.0) * 10;

    // Valuation penalty for extreme P/E (> 60)
    if (peRatio > 60) target -= (peRatio - 60) * 0.3;
    if (peRatio < 15 && profitMargin > 0.1) target += 10; // Value bonus

    // Clamp score between 0 and 100
    target = Math.max(5, Math.min(98, Math.round(target)));

    data.push({
      features: { peRatio, pbRatio, debtToEquity, profitMargin, revenueGrowth, beta, sentimentScore },
      targetScore: target,
    });
  }

  return data;
}

/**
 * Trains the Auravest-FinQuant ML Linear Regression & Weight Optimization Model
 */
export function trainFinQuantModel(): TrainedModelWeights {
  console.log('⚡ Training Auravest-FinQuant Custom Machine Learning Model...');
  const dataset = generateDataset(3000);

  // Initialize weights
  let wPE = -0.1;
  let wPB = -0.2;
  let wDebt = -3.5;
  let wMargin = 75.0;
  let wGrowth = 65.0;
  let wBeta = -5.0;
  let wSentiment = 12.0;
  let bias = 50.0;

  const learningRate = 0.00001;
  const epochs = 500;

  // Gradient descent optimization loop
  for (let epoch = 0; epoch < epochs; epoch++) {
    for (const sample of dataset) {
      const { features: f, targetScore: y } = sample;
      const pred =
        f.peRatio * wPE +
        f.pbRatio * wPB +
        f.debtToEquity * wDebt +
        f.profitMargin * wMargin +
        f.revenueGrowth * wGrowth +
        f.beta * wBeta +
        f.sentimentScore * wSentiment +
        bias;

      const error = pred - y;

      // Update weights via stochastic gradient descent
      wPE -= learningRate * error * f.peRatio;
      wPB -= learningRate * error * f.pbRatio;
      wDebt -= learningRate * error * f.debtToEquity;
      wMargin -= learningRate * error * f.profitMargin;
      wGrowth -= learningRate * error * f.revenueGrowth;
      wBeta -= learningRate * error * f.beta;
      wSentiment -= learningRate * error * f.sentimentScore;
      bias -= learningRate * error;
    }
  }

  const modelWeights: TrainedModelWeights = {
    version: '1.0.0-Auravest-FinQuant',
    trainedAt: new Date().toISOString(),
    sampleCount: dataset.length,
    weights: {
      pe: Number(wPE.toFixed(4)),
      pb: Number(wPB.toFixed(4)),
      debt: Number(wDebt.toFixed(4)),
      margin: Number(wMargin.toFixed(4)),
      growth: Number(wGrowth.toFixed(4)),
      beta: Number(wBeta.toFixed(4)),
      sentiment: Number(wSentiment.toFixed(4)),
      bias: Number(bias.toFixed(4)),
    },
    classificationThresholds: {
      APlus: 82,
      A: 70,
      B: 55,
      C: 40,
    },
  };

  const outputDir = path.join(__dirname, 'models');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const modelFilePath = path.join(outputDir, 'finquant_model.json');
  fs.writeFileSync(modelFilePath, JSON.stringify(modelWeights, null, 2), 'utf-8');

  console.log(`✅ Model Training Complete! Saved weights artifact to: ${modelFilePath}`);
  return modelWeights;
}

// Run script directly if called from CLI
if (require.main === module) {
  trainFinQuantModel();
}
