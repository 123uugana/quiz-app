import { NextResponse } from "next/server";

import { getCurrentAppUser } from "@/lib/current-app-user";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const articleResult = await db.query(
    `SELECT
       id,
       title,
       content,
       summary,
       created_at AS "createdAt"
     FROM articles
     WHERE id = $1 AND user_id = $2`,
    [id, user.id],
  );

  if (!articleResult.rows[0]) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const quizResult = await db.query(
    `SELECT id, question, options
     FROM quizzes
     WHERE article_id = $1
     ORDER BY created_at ASC`,
    [id],
  );

  return NextResponse.json({
    article: {
      ...articleResult.rows[0],
      quizCount: quizResult.rows.length,
      quizzes: quizResult.rows,
    },
  });
}
