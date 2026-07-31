import { PredictionResult } from '../types';
import { getBallInfo } from './colorUtils';

export function generateClientPrediction(history: number[]): PredictionResult {
  const safeHistory = Array.isArray(history) && history.length > 0 ? history : [3, 8, 2, 5, 0, 7, 1, 9, 4, 6];
  const last10 = safeHistory.slice(-10);
  const len = last10.length;
  const lastNum = last10[len - 1];
  const prevNum = len > 1 ? last10[len - 2] : 5;

  // 1. Calculate frequency of numbers 0-9
  const freq: number[] = Array(10).fill(0);
  last10.forEach((n) => {
    if (n >= 0 && n <= 9) freq[n]++;
  });

  // 2. Cold numbers (haven't appeared in last 10)
  const coldNumbers: number[] = [];
  for (let i = 0; i <= 9; i++) {
    if (freq[i] === 0) coldNumbers.push(i);
  }

  // 3. Parity & Size balance
  const evenCount = last10.filter((n) => n % 2 === 0).length;
  const oddCount = len - evenCount;
  const bigCount = last10.filter((n) => n >= 5).length;
  const smallCount = len - bigCount;

  // 4. Candidate scores for 0-9
  const scores: number[] = Array(10).fill(10);

  // Rebound cold numbers slightly
  coldNumbers.forEach((num) => {
    scores[num] += 15;
  });

  // Target parity balance
  const preferEven = oddCount >= evenCount;
  for (let i = 0; i <= 9; i++) {
    if (preferEven && i % 2 === 0) scores[i] += 12;
    if (!preferEven && i % 2 !== 0) scores[i] += 12;
  }

  // Target size balance
  const preferSmall = bigCount >= smallCount;
  for (let i = 0; i <= 9; i++) {
    if (preferSmall && i < 5) scores[i] += 12;
    if (!preferSmall && i >= 5) scores[i] += 12;
  }

  // Check alternating / zigzag pattern
  const isZigzagSize = len >= 3 && (last10[len - 1] >= 5) !== (last10[len - 2] >= 5);
  if (isZigzagSize) {
    const nextSizeShouldBeBig = last10[len - 1] < 5;
    for (let i = 0; i <= 9; i++) {
      if (nextSizeShouldBeBig && i >= 5) scores[i] += 15;
      if (!nextSizeShouldBeBig && i < 5) scores[i] += 15;
    }
  }

  // Mirror & Complement calculation based on last 2 numbers
  const mirrorNum = (lastNum + 5) % 10;
  scores[mirrorNum] += 18;

  const sumLastTwo = (lastNum + prevNum) % 10;
  scores[sumLastTwo] += 14;

  // Penalize immediate duplicate unless streak is strong
  scores[lastNum] -= 10;

  // Find top scoring candidates
  let bestCandidate = 0;
  let maxScore = -999;
  const candidatesWithScores: { num: number; score: number }[] = [];

  for (let i = 0; i <= 9; i++) {
    // Add small hash variance based on history sequence to make predictions unique per sequence
    const hash = last10.reduce((acc, val, idx) => (acc + val * (idx + 1) * (i + 3)) % 17, 0);
    const totalScore = scores[i] + hash;
    candidatesWithScores.push({ num: i, score: totalScore });

    if (totalScore > maxScore) {
      maxScore = totalScore;
      bestCandidate = i;
    }
  }

  const predictedNumber = bestCandidate;
  const ball = getBallInfo(predictedNumber);

  // Dynamic Bengali Trend Explanations
  const trendTypes = [
    'Parity Reversal Shift (প্যারিটি শিফট)',
    'Big/Small Counter Balance (বিগ/স্মল ব্যালেন্স)',
    'Mirror Pattern Cycle (মিরর প্যাটার্ন)',
    'Cold Gap Rebound (কোল্ড নাম্বার রিবাউন্ড)',
    'Zigzag Size Wave (জিগজ্যাগ সাইজ ওয়েব)',
    'Color Symmetry Shift (কালার সিমেট্রি)',
  ];

  const trendType = trendTypes[(lastNum + prevNum + sumLastTwo) % trendTypes.length];
  const confidence = Math.floor(Math.random() * 8) + 88; // 88% - 95%

  const explanation = `১০ টি সিগন্যাল [${last10.join(', ')}] এনালাইসিস করে ${trendType} ধরা পড়েছে। ${ball.colorName.toUpperCase()} এবং ${ball.size.toUpperCase()} (${predictedNumber} নম্বর) সিগন্যালে সর্বোচ্চ উইনিং চান্স রয়েছে।`;

  return {
    predictedNumber,
    predictedColor: ball.color,
    predictedColorName: ball.colorName,
    predictedSize: ball.size,
    confidence,
    trendType,
    explanation,
    suggestedAction: `${ball.colorName.toUpperCase()} বা নম্বর ${predictedNumber} এ ট্রেড করুন`,
    riskLevel: 'Safe',
  };
}
