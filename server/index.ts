import express from "express";
import cors from "cors";
import multer from "multer";

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

app.post(
  "/api/statements/extract",
  upload.single("statement"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: "No statement file was uploaded.",
      });
    }

    console.log(
      `Statement received: ${req.file.originalname}`
    );

    // Temporary extraction result.
    // Real OCR/AI extraction will replace this.
    const today = new Date();

    const dueDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 7
    );

    const bill = {
      id: `scan-${Date.now()}`,
      name: "Example Utility Bill",
      amount: 146.32,
      dueDate: dueDate.toISOString().split("T")[0],
      category: "Utilities",
      recurring: true,
      paid: false,
      autoPay: false,
      notes: `Extracted from ${req.file.originalname}`,
      confidence: 96,
    };

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