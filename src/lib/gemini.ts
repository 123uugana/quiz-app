import "server-only";

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const generatedArticleSchema = z.object({
  summary: z.string().min(1),
  quizzes: z
    .array(
      z.object({
        question: z.string().min(1),
        options: z.array(z.string().min(1)).length(4),
        answer: z.string().min(1),
      }),
    )
    .min(1)
    .max(5),
});

const responseJsonSchema = {
  type: "object",
  properties: {
    summary: {
      type: "string",
      description:
        "A clear, concise summary of the article in the same language as the article.",
    },
    quizzes: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        properties: {
          question: {
            type: "string",
            description: "A question answerable from the article.",
          },
          options: {
            type: "array",
            minItems: 4,
            maxItems: 4,
            items: { type: "string" },
            description: "Four distinct answer choices.",
          },
          answer: {
            type: "string",
            description:
              "The exact correct choice copied from the options array.",
          },
        },
        required: ["question", "options", "answer"],
        additionalProperties: false,
      },
    },
  },
  required: ["summary", "quizzes"],
  additionalProperties: false,
} as const;

export async function generateArticleLearningContent(
  title: string,
  content: string,
) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `You are an educational content assistant.

Summarize the article and create exactly 5 multiple-choice quiz questions.
Use only facts contained in the article.
Write the summary, questions, and choices in the same language as the article.
Each question must have exactly four distinct options.
The answer must exactly match one item in options.

Article title:
${title}

Article content:
${content}`,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema,
      temperature: 0.3,
    },
  });

  const parsed = generatedArticleSchema.parse(
    JSON.parse(response.text ?? "{}"),
  );

  for (const quiz of parsed.quizzes) {
    if (!quiz.options.includes(quiz.answer)) {
      throw new Error("Gemini returned an answer outside the options list.");
    }
  }

  return parsed;
}
