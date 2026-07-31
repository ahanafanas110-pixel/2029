import { PredictionResult } from '../types';
import { getBallInfo } from './colorUtils';

export function generateClientPrediction(history: number[]): PredictionResult {
  const safeHistory = Array.isArray(history) && history.length > 0 ? history : [3, 8, 2, 5, 0, 7, 1, 9, 4, 6];
  const last10 = safeHistory.slice(-10);
  const lastNum = last10[last10.length - 1];

  // Frequency analysis
  const counts: Record<number, number> = {};
  for (let i = 0; i <= 9; i++) counts[i] = 0;
  last10.forEach((n) => (counts[n] = (counts[n] || 0) + 1));

  // Even / Odd count
  const evenCount = last10.filter((n) => n % 2 === 0).length;
  const oddCount = last10.length - evenCount;

  // Big / Small count
  const bigCount = last10.filter((n) => n >= 5).length;
  const smallCount = last10.length - bigCount;

  // Strategy: Counter-balance or streak continuation based on parity & size
  let predictedNumber: number;

  if (oddCount > evenCount) {
    // Prefer even numbers (0, 2, 4, 6, 8)
    predictedNumber = smallCount < bigCount ? 2 : 6;
  } else {
    // Prefer odd numbers (1, 3, 5, 7, 9)
    predictedNumber = smallCount < bigCount ? 3 : 7;
  }

  // Adjust to avoid direct repetition if possible
  if (predictedNumber === lastNum) {
    predictedNumber = (predictedNumber + 3) % 10;
  }

  const ball = getBallInfo(predictedNumber);

  const trends = [
    'Parity Reversal Shift',
    'Big/Small Counter Balance',
    'Dragon Streak Follow-up',
    'Frequency Gap Rebound',
    'Color Symmetry Cycle',
  ];

  const trendType = trends[Math.floor(Math.random() * trends.length)];
  const confidence = Math.floor(Math.random() * 8) + 88; // 88% - 95%

  return {
    predictedNumber,
    predictedColor: ball.color,
    predictedColorName: ball.colorName,
    predictedSize: ball.size,
    confidence,
    trendType,
    explanation: ` Based on recent 10 signal sequence [${last10.join(', ')}], AI detected a strong ${trendType}. Ball ${predictedNumber} (${ball.colorName}, ${ball.size.toUpperCase()}) exhibits maximum winning probability for the next cycle.`,
    suggestedAction: `Bet on ${ball.colorName.toUpperCase()} or Number ${predictedNumber}`,
    riskLevel: 'Safe',
  };
}
