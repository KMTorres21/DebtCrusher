import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

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
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          ok: false,
          message: "No statement file was uploaded.",
        });
      }

      console.log(
        `Statement received: ${req.file.originalname}`
      );

      const prompt = `
Analyze this financial statement and identify every recurring bill
or payment obligation.

Return ONLY JSON matching the requested schema.

For each bill, extract:
- name
- amount
- dueDate
- apr
- category
- recurring
- paid
- autoPay
- notes
- confidence

Rules:
- amount must be the normal recurring payment amount when identifiable.
- dueDate should use YYYY-MM-DD when a specific due date can be determined.
- category should be a reasonable category such as Utilities, Insurance,
  Mortgage, Rent, Credit Card, Loan, Subscription, Phone, Internet,
  Medical, or Other.
- apr should be a number representing the annual percentage rate when explicitly stated on the statement, expressed as a number such as 24.99 for 24.99%. 
- do not calculate or infer APR
- If APR is not explicityl stated, return null.
- recurring should be true only when the payment appears recurring.
- paid should reflect whether the statement indicates the bill was already paid.
- autoPay should be true only when the statement explicitly indicates
  automatic payment/autopay.
- confidence should be a number from 0 to 100.
- Do not invent information.
- If something cannot be determined, use null.
- Identify actual bills from the document. Do not create example or
  placeholder bills.
`;

      let response;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(
            `Gemini extraction attempt ${attempt} of 3...`
          );

          response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: [
              {
                text: prompt,
              },
              {
                inlineData: {
                  mimeType:
                    req.file.mimetype || "application/pdf",
                  data: req.file.buffer.toString("base64"),
                },
              },
            ],
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  bills: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: {
                          type: Type.STRING,
                          nullable: true,
                        },
                        amount: {
                          type: Type.NUMBER,
                          nullable: true,
                        },
                        apr: {
                          type: Type.NUMBER,
                          nullable: true,
                        },
                        dueDate: {
                          type: Type.STRING,
                          nullable: true,
                        },
                        category: {
                          type: Type.STRING,
                          nullable: true,
                        },
                        recurring: {
                          type: Type.BOOLEAN,
                          nullable: true,
                        },
                        paid: {
                          type: Type.BOOLEAN,
                          nullable: true,
                        },
                        autoPay: {
                          type: Type.BOOLEAN,
                          nullable: true,
                        },
                        notes: {
                          type: Type.STRING,
                          nullable: true,
                        },
                        confidence: {
                          type: Type.NUMBER,
                          nullable: true,
                        },
                      },
                      required: [
                        "name",
                        "amount",
                        "dueDate",
                        "category",
                        "recurring",
                        "paid",
                        "autoPay",
                        "notes",
                        "confidence",
                        "apr",
                      ],
                    },
                  },
                },
                required: ["bills"],
              },
            },
          });

          break;
        } catch (error: any) {
          const status =
            error?.status ??
            error?.statusCode ??
            error?.code;

          console.error(
            `Gemini attempt ${attempt} failed. Status: ${status}`
          );

          if (
            status !== 503 ||
            attempt === 3
          ) {
            throw error;
          }

          const delay = attempt * 2000;

          console.log(
            `Gemini temporarily unavailable. Retrying in ${delay / 1000} seconds...`
          );

          await new Promise((resolve) =>
            setTimeout(resolve, delay)
          );
        }
      }

      if (!response) {
        throw new Error(
          "Gemini did not return a response."
        );
      }

      const extracted = JSON.parse(
        response.text || '{"bills":[]}'
      );

      console.log(
        `Extracted ${extracted.bills.length} bill(s) from ${req.file.originalname}`
      );

      return res.json({
        ok: true,
        bills: extracted.bills,
        filename: req.file.originalname,
      });
    } catch (error) {
      console.error(
        "Statement extraction failed:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "Unable to extract bills from the statement.",
      });
    }
  }
);

const PORT = 3001;

app.listen(PORT, () => {
  console.log(
    `DebtCrusher API running on http://localhost:${PORT}`
  );
});