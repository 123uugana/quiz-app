import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentAppUser } from "@/lib/current-app-user";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const attemptSchema = z.object({
  answers: z.record(z.string(), z.string()),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const input = attemptSchema.safeParse(await request.json());

  if (!input.success) {
    return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
  }

  const { id } = await params;
  const { rows } = await db.query<{
    id: string;
    answer: string;
  }>(
    `SELECT q.id, q.answer
     FROM quizzes q
     INNER JOIN articles a ON a.id = q.article_id
     WHERE q.article_id = $1 AND a.user_id = $2`,
    [id, user.id],
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const correctAnswers: Record<string, string> = {};
  let score = 0;

  for (const quiz of rows) {
    correctAnswers[quiz.id] = quiz.answer;
    if (input.data.answers[quiz.id] === quiz.answer) {
      score += 1;
    }
  }

  await db.query(
    `INSERT INTO quiz_attempts (user_id, article_id, score, total, answers)
     VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [user.id, id, score, rows.length, JSON.stringify(input.data.answers)],
  );

  return NextResponse.json({
    result: {
      score,
      total: rows.length,
      correctAnswers,
    },
  });
}
