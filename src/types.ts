export type BallColor = 'green' | 'red' | 'red-violet' | 'green-violet';
export type BallSize = 'big' | 'small';

export interface Ball {
  number: number; // 0 to 9
  color: BallColor;
  size: BallSize;
  colorName: string;
}

export interface HistoryItem {
  id: string;
  number: number;
  color: BallColor;
  size: BallSize;
  timestamp: string;
  predictedWasCorrect?: boolean;
}

export interface PredictionResult {
  predictedNumber: number;
  predictedColor: BallColor;
  predictedColorName: string;
  predictedSize: BallSize;
  confidence: number; // e.g. 85-98%
  trendType: string; // e.g. "Alternate Reversal", "Dragon Streak", "Parity Balance"
  explanation: string;
  suggestedAction: string;
  riskLevel: 'Safe' | 'Moderate' | 'Aggressive';
}

export interface PredictionStats {
  totalPredictions: number;
  wins: number;
  losses: number;
  currentStreak: number;
  bestStreak: number;
}
