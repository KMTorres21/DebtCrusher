import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    message: "DebtCrusher backend is running",
  });
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`DebtCrusher API running on http://localhost:${PORT}`);
});