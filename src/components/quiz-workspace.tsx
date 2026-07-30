"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  LoaderCircle,
  Menu,
  Plus,
  Sparkles,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { DesktopSidebar, Sidebar } from "@/components/ui/sidebar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { AiLoader } from "@/components/ui/ai-loader";
import type {
  Article,
  ArticleListItem,
  AttemptResult,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type ApiError = {
  error?: string;
};

async function requestArticleHistory() {
  const response = await fetch("/api/articles");
  const data = (await response.json()) as ApiError & {
    articles?: ArticleListItem[];
  };

  if (!response.ok || !data.articles) {
    throw new Error(data.error || "Could not load article history.");
  }

  return data.articles;
}

function HistoryList({
  articles,
  selectedId,
  loading,
  onNew,
  onSelect,
}: {
  articles: ArticleListItem[];
  selectedId?: string;
  loading: boolean;
  onNew: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <nav aria-label="Article history" className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-3 pb-2 pt-4">
        <h2 className="text-sm font-semibold text-foreground">History</h2>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onNew}
          aria-label="Create new article"
          className="metal-control"
        >
          <Plus />
        </Button>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoaderCircle className="size-5 animate-spin" />
          </div>
        ) : articles.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            Your generated articles will appear here.
          </p>
        ) : (
          articles.map((article) => (
            <button
              key={article.id}
              type="button"
              onClick={() => onSelect(article.id)}
              className={cn(
                "metal-history-item w-full rounded-xl px-2.5 py-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selectedId === article.id
                  ? "metal-history-item-selected text-foreground"
                  : "text-foreground/80 hover:text-foreground",
              )}
            >
              <span className="line-clamp-2 text-sm font-medium leading-snug">
                {article.title}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {new Date(article.createdAt).toLocaleDateString()} ·{" "}
                {article.quizCount} questions
              </span>
            </button>
          ))
        )}
      </div>
    </nav>
  );
}

function GeneratorForm({
  onCreated,
}: {
  onCreated: (article: Article) => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit =
    title.trim().length >= 2 && content.trim().length >= 50 && !submitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const data = (await response.json()) as ApiError & { article?: Article };

      if (!response.ok || !data.article) {
        throw new Error(data.error || "Could not generate this article.");
      }

      onCreated(data.article);
      setTitle("");
      setContent("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="metal-card w-full max-w-2xl overflow-hidden rounded-3xl">
      <CardHeader className="gap-2">
        <CardTitle className="flex items-center gap-2 text-lg text-foreground">
          <Sparkles className="size-5" aria-hidden="true" />
          Article Quiz Generator
        </CardTitle>
        <CardDescription className="max-w-xl leading-relaxed">
          Paste an article to generate a concise summary and five quiz
          questions. The result will be saved to your history.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label
              htmlFor="article-title"
              className="flex items-center gap-1.5"
            >
              <FileText className="size-3.5" aria-hidden="true" />
              Article Title
            </Label>
            <Input
              id="article-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter a title for your article..."
              maxLength={200}
              autoComplete="off"
              disabled={submitting}
              className="metal-field h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <Label
                htmlFor="article-content"
                className="flex items-center gap-1.5"
              >
                <FileText className="size-3.5" aria-hidden="true" />
                Article Content
              </Label>
              <span className="text-xs text-muted-foreground">
                {content.trim().length}/50 minimum
              </span>
            </div>
            <Textarea
              id="article-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Paste your article content here..."
              className="metal-field min-h-52 resize-y rounded-xl"
              maxLength={50_000}
              disabled={submitting}
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <LiquidMetalButton
              type="submit"
              label="Generate summary"
              loading={submitting}
              disabled={!canSubmit}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ArticleResult({
  article,
  onBack,
}: {
  article: Article;
  onBack: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const allAnswered = article.quizzes.every((quiz) => answers[quiz.id]);

  async function submitQuiz() {
    if (!allAnswered || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/articles/${article.id}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = (await response.json()) as ApiError & {
        result?: AttemptResult;
      };

      if (!response.ok || !data.result) {
        throw new Error(data.error || "Could not submit this quiz.");
      }

      setResult(data.result);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-3xl space-y-6">
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        className="metal-control rounded-full"
      >
        <ArrowLeft />
        New article
      </Button>

      <Card className="metal-card overflow-hidden rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">
            {article.title}
          </CardTitle>
          <CardDescription>
            Generated {new Date(article.createdAt).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="metal-inset rounded-2xl p-4 sm:p-5">
            <h2 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
              <Sparkles className="size-4" />
              Summary
            </h2>
            <p className="whitespace-pre-wrap leading-relaxed">
              {article.summary}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="metal-card overflow-hidden rounded-3xl">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">
            Test your knowledge
          </CardTitle>
          <CardDescription>
            Answer all {article.quizzes.length} questions and submit your quiz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-7">
          {article.quizzes.map((quiz, quizIndex) => (
            <fieldset key={quiz.id} className="space-y-3">
              <legend className="font-medium leading-relaxed text-foreground">
                {quizIndex + 1}. {quiz.question}
              </legend>
              <div className="grid gap-2">
                {quiz.options.map((option) => {
                  const selected = answers[quiz.id] === option;
                  const correct = result?.correctAnswers[quiz.id] === option;
                  const incorrect = Boolean(result && selected && !correct);

                  return (
                    <label
                      key={option}
                      className={cn(
                        "metal-option flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-sm leading-relaxed",
                        !result && selected && "metal-option-selected",
                        result && correct && "border-emerald-500 bg-emerald-50",
                        incorrect && "border-destructive bg-destructive/10",
                        result && !selected && !correct && "opacity-65",
                      )}
                    >
                      <input
                        type="radio"
                        name={quiz.id}
                        value={option}
                        checked={selected}
                        disabled={Boolean(result)}
                        onChange={() =>
                          setAnswers((current) => ({
                            ...current,
                            [quiz.id]: option,
                          }))
                        }
                        className="mt-0.5 size-4 accent-foreground"
                      />
                      <span className="flex-1">{option}</span>
                      {result && correct && (
                        <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                      )}
                      {incorrect && (
                        <XCircle className="size-5 shrink-0 text-destructive" />
                      )}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          {result ? (
            <div
              role="status"
              className="metal-inset rounded-2xl p-5 text-center"
            >
              <p className="text-sm text-muted-foreground">Your score</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">
                {result.score}/{result.total}
              </p>
              <Button
                type="button"
                variant="outline"
                className="metal-control mt-4 rounded-full"
                onClick={() => {
                  setAnswers({});
                  setResult(null);
                }}
              >
                Try again
              </Button>
            </div>
          ) : (
            <div className="flex justify-end">
              <LiquidMetalButton
                type="button"
                label="Submit quiz"
                loadingLabel="Submitting..."
                loading={submitting}
                disabled={!allAnswered || submitting}
                onClick={submitQuiz}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function QuizWorkspace() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [articleLoading, setArticleLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  async function loadHistory() {
    setHistoryLoading(true);

    try {
      setArticles(await requestArticleHistory());
      setPageError("");
    } catch (requestError) {
      setPageError(
        requestError instanceof Error
          ? requestError.message
          : "Could not load article history.",
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    void requestArticleHistory()
      .then((loadedArticles) => {
        if (!cancelled) {
          setArticles(loadedArticles);
          setHistoryLoading(false);
        }
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setPageError(
            requestError instanceof Error
              ? requestError.message
              : "Could not load article history.",
          );
          setHistoryLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function selectArticle(id: string) {
    setMobileMenuOpen(false);
    setArticleLoading(true);
    setPageError("");

    try {
      const response = await fetch(`/api/articles/${id}`);
      const data = (await response.json()) as ApiError & { article?: Article };

      if (!response.ok || !data.article) {
        throw new Error(data.error || "Could not load this article.");
      }

      setSelectedArticle(data.article);
    } catch (requestError) {
      setPageError(
        requestError instanceof Error
          ? requestError.message
          : "Could not load this article.",
      );
    } finally {
      setArticleLoading(false);
    }
  }

  function showGenerator() {
    setSelectedArticle(null);
    setMobileMenuOpen(false);
    setPageError("");
  }

  function handleCreated(article: Article) {
    setSelectedArticle(article);
    setArticles((current) => [
      {
        id: article.id,
        title: article.title,
        createdAt: article.createdAt,
        quizCount: article.quizCount,
      },
      ...current.filter((item) => item.id !== article.id),
    ]);
  }

  const historyProps = {
    articles,
    selectedId: selectedArticle?.id,
    loading: historyLoading,
    onNew: showGenerator,
    onSelect: selectArticle,
  };

  return (
    <div className="metal-app flex min-h-screen flex-col text-foreground">
      <header className="metal-header sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="metal-control rounded-full md:hidden"
            aria-label="Open history"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu />
          </Button>
          <button
            type="button"
            onClick={showGenerator}
            className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground"
          >
            <span className="metal-control flex size-8 items-center justify-center rounded-full">
              <Sparkles className="size-4" />
            </span>
            Quiz app
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Show when="signed-out">
            <SignInButton>
              <Button variant="ghost" className="metal-control rounded-full">
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button className="rounded-full shadow-lg">Sign up</Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "size-9",
                },
              }}
            />
          </Show>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
          <DesktopSidebar className="metal-sidebar border-r px-0 py-0">
            {sidebarOpen ? (
              <HistoryList {...historyProps} />
            ) : (
              <div className="flex h-12 shrink-0 items-center justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={showGenerator}
                  aria-label="Create new article"
                  className="metal-control"
                >
                  <Plus />
                </Button>
              </div>
            )}
          </DesktopSidebar>
        </Sidebar>

        <main className="relative flex flex-1 items-start justify-center overflow-hidden px-4 py-8 sm:px-8 sm:py-12 lg:py-16">
          {articleLoading ? (
            <div className="flex w-full justify-center py-24">
              <AiLoader
                label="Loading article"
                className="[&_.ai-loader-letter]:text-muted-foreground [&_.ai-loader-bar]:bg-foreground/10"
              />
            </div>
          ) : pageError ? (
            <Card className="metal-card w-full max-w-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Something went wrong
                </CardTitle>
                <CardDescription>{pageError}</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => void loadHistory()}
                  className="rounded-full"
                >
                  Try again
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={showGenerator}
                  className="metal-control rounded-full"
                >
                  New article
                </Button>
              </CardContent>
            </Card>
          ) : selectedArticle ? (
            <ArticleResult
              key={selectedArticle.id}
              article={selectedArticle}
              onBack={showGenerator}
            />
          ) : (
            <GeneratorForm onCreated={handleCreated} />
          )}
        </main>
      </div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="metal-sidebar w-[85%] max-w-xs border-r p-0"
        >
          <SheetHeader className="border-b border-white/70 pr-12 text-left">
            <SheetTitle>Quiz app</SheetTitle>
            <SheetDescription>Your saved article history</SheetDescription>
          </SheetHeader>
          <HistoryList {...historyProps} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
