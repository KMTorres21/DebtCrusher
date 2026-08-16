import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import OpenAI, { toFile } from "openai";

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
const app = express();


app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    message: "DebtCrusher backend is running.",
  });
});



    return res.json({
      ok: true,
      bills: [bill],
    });
  }
);

const PORT = 3001;

app.listen(PORT, () => {
  console.log(
    `DebtCrusher API running on http://localhost:${PORT}`
  );
});