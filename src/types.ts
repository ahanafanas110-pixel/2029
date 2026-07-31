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
  predictedColor?: BallColor;
  predictedWasCorrect?: boolean;
}

export interface PredictionResult {
  predictedColor: BallColor;
  predictedColorName: string;
  confidence: number; // 96-99%
  colorProbabilities: {
    green: number;
    red: number;
    violet: number;
  };
  trendType: string;
  explanation: string;
  suggestedAction: string;
  riskLevel: 'Safe' | 'Moderate' | 'High Accuracy';
}

export interface PredictionStats {
  totalPredictions: number;
  wins: number;
  losses: number;
  currentStreak: number;
  bestStreak: number;
}
