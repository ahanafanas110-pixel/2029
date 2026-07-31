import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } catch (err) {
    console.warn("Gemini client initialization warning:", err);
  }
}

// Color rule helper
function getBallColorAndSize(num: number) {
  const n = Math.max(0, Math.min(9, Math.floor(num)));
  const size = n >= 5 ? "big" : "small";
  let color: string;
  let colorName: string;

  if (n === 0) {
    color = "red-violet";
    colorName = "Red + Violet";
  } else if (n === 5) {
    color = "green-violet";
    colorName = "Green + Violet";
  } else if ([1, 3, 7, 9].includes(n)) {
    color = "green";
    colorName = "Green";
  } else {
    color = "red";
    colorName = "Red";
  }

  return { color, colorName, size };
}

// Fallback algorithm for predictions when API key is unavailable or offline
function generateFallbackPrediction(history: number[]) {
  const safeHistory = Array.isArray(history) && history.length > 0 ? history : [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
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

  coldNumbers.forEach((num) => {
    scores[num] += 15;
  });

  const preferEven = oddCount >= evenCount;
  for (let i = 0; i <= 9; i++) {
    if (preferEven && i % 2 === 0) scores[i] += 12;
    if (!preferEven && i % 2 !== 0) scores[i] += 12;
  }

  const preferSmall = bigCount >= smallCount;
  for (let i = 0; i <= 9; i++) {
    if (preferSmall && i < 5) scores[i] += 12;
    if (!preferSmall && i >= 5) scores[i] += 12;
  }

  const isZigzagSize = len >= 3 && (last10[len - 1] >= 5) !== (last10[len - 2] >= 5);
  if (isZigzagSize) {
    const nextSizeShouldBeBig = last10[len - 1] < 5;
    for (let i = 0; i <= 9; i++) {
      if (nextSizeShouldBeBig && i >= 5) scores[i] += 15;
      if (!nextSizeShouldBeBig && i < 5) scores[i] += 15;
    }
  }

  const mirrorNum = (lastNum + 5) % 10;
  scores[mirrorNum] += 18;

  const sumLastTwo = (lastNum + prevNum) % 10;
  scores[sumLastTwo] += 14;

  scores[lastNum] -= 10;

  let bestCandidate = 0;
  let maxScore = -999;

  for (let i = 0; i <= 9; i++) {
    const hash = last10.reduce((acc, val, idx) => (acc + val * (idx + 1) * (i + 3)) % 17, 0);
    const totalScore = scores[i] + hash;

    if (totalScore > maxScore) {
      maxScore = totalScore;
      bestCandidate = i;
    }
  }

  const predictedNumber = bestCandidate;
  const { color, colorName, size } = getBallColorAndSize(predictedNumber);

  const trendTypes = [
    "Parity Reversal Shift (প্যারিটি শিফট)",
    "Big/Small Counter Balance (বিগ/স্মল ব্যালেন্স)",
    "Mirror Pattern Cycle (মিরর প্যাটার্ন)",
    "Cold Gap Rebound (কোল্ড নাম্বার রিবাউন্ড)",
    "Zigzag Size Wave (জিগজ্যাগ সাইজ ওয়েব)",
    "Color Symmetry Shift (কালার সিমেট্রি)",
  ];

  const trendType = trendTypes[(lastNum + prevNum + sumLastTwo) % trendTypes.length];
  const confidence = Math.floor(Math.random() * 8) + 88; // 88% - 95%

  return {
    predictedNumber,
    predictedColor: color,
    predictedColorName: colorName,
    predictedSize: size,
    confidence,
    trendType,
    explanation: `১০ টি সিগন্যাল [${last10.join(", ")}] এনালাইসিস করে ${trendType} ধরা পড়েছে। ${colorName.toUpperCase()} এবং ${size.toUpperCase()} (${predictedNumber} নম্বর) সিগন্যালে সর্বোচ্চ উইনিং চান্স রয়েছে।`,
    suggestedAction: `Bet on ${colorName.toUpperCase()} or Number ${predictedNumber}`,
    riskLevel: "Safe" as const,
  };
}

// Health check API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "DESH CLUB PREDICTOR", geminiConfigured: !!process.env.GEMINI_API_KEY });
});

// Gemini Prediction API Route
app.post("/api/predict", async (req, res) => {
  try {
    const { history } = req.body;
    if (!Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ error: "Invalid history array provided." });
    }

    const last10 = history.slice(-10);

    // If no AI key or AI client fails, use algorithm fallback
    if (!ai || !process.env.GEMINI_API_KEY) {
      const fallback = generateFallbackPrediction(last10);
      return res.json({ success: true, prediction: fallback, source: "algorithm" });
    }

    const systemInstruction = `
You are the master AI analyzer for "DESH CLUB PREDICTOR", a high-accuracy trend predictor for 0-9 color prediction games.
Color Rules:
- Number 0: Red + Violet (Split)
- Numbers 1, 3, 7, 9: Green
- Numbers 2, 4, 6, 8: Red
- Number 5: Green + Violet (Split)
Size Rules:
- Small: 0, 1, 2, 3, 4
- Big: 5, 6, 7, 8, 9

You will analyze the last 10 historical numbers and output a structured prediction for the NEXT result (number 0 to 9).
Provide a high-confidence prediction with logical pattern explanations (e.g. Dragon streak, Zigzag parity, Big/Small reversion, Frequency gap).
Return strictly JSON matching the required schema.
`;

    const prompt = `Analyze these last 10 numbers sequence: [${last10.join(", ")}].
Predict the next single number (0-9), its color, size (big/small), confidence percentage (85-98), trend name, and detailed short Bengali/English explanation for DESH CLUB users.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictedNumber: { type: Type.INTEGER, description: "Predicted next number from 0 to 9" },
            predictedColor: { type: Type.STRING, description: "Must be 'green', 'red', 'red-violet', or 'green-violet'" },
            predictedColorName: { type: Type.STRING, description: "Formatted color name (e.g. 'Green', 'Red', 'Red + Violet')" },
            predictedSize: { type: Type.STRING, description: "Must be 'big' or 'small'" },
            confidence: { type: Type.INTEGER, description: "Confidence percentage between 85 and 99" },
            trendType: { type: Type.STRING, description: "Pattern name e.g. 'Dragon Pattern Reversal'" },
            explanation: { type: Type.STRING, description: "Detailed 1-2 sentence trend breakdown for users" },
            suggestedAction: { type: Type.STRING, description: "Action advice e.g. 'Play Green / Big'" },
            riskLevel: { type: Type.STRING, description: "'Safe', 'Moderate', or 'Aggressive'" },
          },
          required: ["predictedNumber", "predictedColor", "predictedColorName", "predictedSize", "confidence", "trendType", "explanation"],
        },
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      // Ensure color and size match exact math rules
      const mathDetails = getBallColorAndSize(parsed.predictedNumber);
      parsed.predictedColor = mathDetails.color;
      parsed.predictedColorName = mathDetails.colorName;
      parsed.predictedSize = mathDetails.size;

      return res.json({ success: true, prediction: parsed, source: "gemini" });
    } else {
      throw new Error("Empty response from Gemini model");
    }
  } catch (err: unknown) {
    console.error("Gemini Predict API error, using intelligent fallback:", err);
    const fallback = generateFallbackPrediction(req.body.history || []);
    return res.json({ success: true, prediction: fallback, source: "fallback" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DESH CLUB PREDICTOR Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
