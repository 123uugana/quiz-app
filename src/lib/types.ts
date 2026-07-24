export type Quiz = {
  id: string;
  question: string;
  options: string[];
};

export type ArticleListItem = {
  id: string;
  title: string;
  createdAt: string;
  quizCount: number;
};

export type Article = ArticleListItem & {
  content: string;
  summary: string;
  quizzes: Quiz[];
};

export type AttemptResult = {
  score: number;
  total: number;
  correctAnswers: Record<string, string>;
};
