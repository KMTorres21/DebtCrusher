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

      const uploadedFile = await openai.files.create({
        file: await toFile(
          req.file.buffer,
          req.file.originalname
        ),
        purpose: "user_data",
      });

      const response = await openai.responses.create({
        model: "gpt-4.1",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_file",
                file_id: uploadedFile.id,
              },
              {
                type: "input_text",
                text: `
Analyze this financial statement and identify every recurring bill or payment obligation.

Return ONLY the structured JSON requested by the schema.

For each bill, extract:
- name
- amount
- dueDate
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
- recurring should be true only when the payment appears recurring.
- paid should reflect whether the statement indicates the bill was already paid.
- autoPay should be true only when the statement explicitly indicates
  automatic payment/autopay.
- confidence should be a number from 0 to 100.
- Do not invent information.
- If something cannot be determined, use null.
                `,
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "debtcrusher_statement",
            strict: true,
            schema: {
              type: "object",
              properties: {
                bills: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: {
                        type: ["string", "null"],
                      },
                      amount: {
                        type: ["number", "null"],
                      },
                      dueDate: {
                        type: ["string", "null"],
                      },
                      category: {
                        type: ["string", "null"],
                      },
                      recurring: {
                        type: ["boolean", "null"],
                      },
                      paid: {
                        type: ["boolean", "null"],
                      },
                      autoPay: {
                        type: ["boolean", "null"],
                      },
                      notes: {
                        type: ["string", "null"],
                      },
                      confidence: {
                        type: ["number", "null"],
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
                    ],
                    additionalProperties: false,
                  },
                },
              },
              required: ["bills"],
              additionalProperties: false,
            },
          },
        },
      });

      const extracted = JSON.parse(response.output_text);

      return res.json({
        ok: true,
        bills: extracted.bills,
        filename: req.file.originalname,
      });
    } catch (error) {
      console.error("Statement extraction failed:", error);

      return res.status(500).json({
        ok: false,
        message: "Unable to extract bills from the statement.",
      });
    }
  }
);

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