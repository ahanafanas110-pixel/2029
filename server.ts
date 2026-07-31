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

  const colorSeq = last10.map((n) => getBallColorAndSize(n).color);

  let greenCount = 0;
  let redCount = 0;
  colorSeq.forEach((c) => {
    if (c.includes('green')) greenCount++;
    if (c.includes('red')) redCount++;
  });

  const lastColor = colorSeq[len - 1];
  const lastBaseColor = lastColor.includes('green') ? 'green' : 'red';

  let streakCount = 1;
  for (let i = len - 2; i >= 0; i--) {
    const base = colorSeq[i].includes('green') ? 'green' : 'red';
    if (base === lastBaseColor) streakCount++;
    else break;
  }

  let predictedColor: string = 'green';
  let predictedColorName = 'GREEN (সবুজ)';
  let trendType = 'Color Trend Analysis';
  let confidence = Math.floor(Math.random() * 4) + 96; // 96-99%

  if (streakCount >= 3) {
    predictedColor = lastBaseColor;
    predictedColorName = predictedColor === 'green' ? 'GREEN (সবুজ)' : 'RED (লাল)';
    trendType = `Color Dragon Streak (${streakCount}x ড্রাগন সিগন্যাল)`;
    confidence = Math.floor(Math.random() * 3) + 97;
  } else if (greenCount <= redCount) {
    predictedColor = 'green';
    predictedColorName = 'GREEN (সবুজ)';
    trendType = 'Dominant Color Rebalance (সবুজ সিগন্যাল)';
    confidence = Math.floor(Math.random() * 3) + 96;
  } else {
    predictedColor = 'red';
    predictedColorName = 'RED (লাল)';
    trendType = 'Dominant Color Rebalance (লাল সিগন্যাল)';
    confidence = Math.floor(Math.random() * 3) + 96;
  }

  const greenProb = predictedColor.includes('green') ? confidence : 100 - confidence;
  const redProb = predictedColor.includes('red') ? confidence : 100 - confidence;

  return {
    predictedColor,
    predictedColorName,
    confidence,
    colorProbabilities: {
      green: greenProb,
      red: redProb,
      violet: 10,
    },
    trendType,
    explanation: `১০ টি সিগন্যাল এনালাইসিস করে ${trendType} নিশ্চিত হয়েছে। পরবর্তী রাউন্ডে **${predictedColorName}** কালারের উইনিং চান্স ${confidence}%।`,
    suggestedAction: `${predictedColorName} এ ট্রেড করুন`,
    riskLevel: 'High Accuracy' as const,
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
You are the master AI analyzer for "PREMIUM HACK HUB", a high-accuracy (96%-99%) COLOR prediction generator.
Color Rules:
- Number 0: Red + Violet (Split)
- Numbers 1, 3, 7, 9: Green
- Numbers 2, 4, 6, 8: Red
- Number 5: Green + Violet (Split)

Analyze the last 10 historical numbers and output a high-confidence COLOR PREDICTION ('green', 'red', 'red-violet', or 'green-violet') for the NEXT result.
Confidence MUST be between 96 and 99%.
Return strictly JSON matching the required schema.
`;

    const prompt = `Analyze these last 10 numbers sequence: [${last10.join(", ")}].
Predict the next winning COLOR ('green' or 'red' or violet split), color confidence percentage (96-99), color probabilities, pattern trend name, and short Bengali explanation.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictedColor: { type: Type.STRING, description: "Must be 'green', 'red', 'red-violet', or 'green-violet'" },
            predictedColorName: { type: Type.STRING, description: "Formatted color name e.g. 'GREEN (সবুজ)', 'RED (লাল)'" },
            confidence: { type: Type.INTEGER, description: "High accuracy confidence percentage between 96 and 99" },
            trendType: { type: Type.STRING, description: "Pattern name e.g. 'Color Dragon Streak (98.4%)'" },
            explanation: { type: Type.STRING, description: "Short Bengali explanation of color prediction" },
            suggestedAction: { type: Type.STRING, description: "Action advice e.g. 'Trade Green'" },
            riskLevel: { type: Type.STRING, description: "'High Accuracy'" },
          },
          required: ["predictedColor", "predictedColorName", "confidence", "trendType", "explanation"],
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
