import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentAppUser } from "@/lib/current-app-user";
import { db } from "@/lib/db";
import { generateArticleLearningContent } from "@/lib/gemini";

export const runtime = "nodejs";

const createArticleSchema = z.object({
  title: z.string().trim().min(2).max(200),
  content: z.string().trim().min(50).max(50_000),
});

export async function GET() {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await db.query(
    `SELECT
       a.id,
       a.title,
       a.created_at AS "createdAt",
       COUNT(q.id)::int AS "quizCount"
     FROM articles a
     LEFT JOIN quizzes q ON q.article_id = a.id
     WHERE a.user_id = $1
     GROUP BY a.id
     ORDER BY a.created_at DESC`,
    [user.id],
  );

  return NextResponse.json({ articles: rows });
}

export async function POST(request: Request) {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsedInput = createArticleSchema.safeParse(await request.json());

  if (!parsedInput.success) {
    return NextResponse.json(
      {
        error:
          "Title must be at least 2 characters and content at least 50 characters.",
      },
      { status: 400 },
    );
  }

  try {
    const { title, content } = parsedInput.data;
    const generated = await generateArticleLearningContent(title, content);
    const client = await db.connect();

    try {
      await client.query("BEGIN");
      const articleResult = await client.query(
        `INSERT INTO articles (title, content, summary, user_id)
         VALUES ($1, $2, $3, $4)
         RETURNING
           id,
           title,
           content,
           summary,
           created_at AS "createdAt"`,
        [title, content, generated.summary, user.id],
      );
      const article = articleResult.rows[0];
      const quizzes = [];

      for (const quiz of generated.quizzes) {
        const quizResult = await client.query(
          `INSERT INTO quizzes (question, options, answer, article_id)
           VALUES ($1, $2::jsonb, $3, $4)
           RETURNING id, question, options`,
          [
            quiz.question,
            JSON.stringify(quiz.options),
            quiz.answer,
            article.id,
          ],
        );
        quizzes.push(quizResult.rows[0]);
      }

      await client.query("COMMIT");

      return NextResponse.json(
        {
          article: {
            ...article,
            quizCount: quizzes.length,
            quizzes,
          },
        },
        { status: 201 },
      );
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Article generation failed", error);
    return NextResponse.json(
      { error: "Could not generate the summary and quiz. Please try again." },
      { status: 500 },
    );
  }
}
