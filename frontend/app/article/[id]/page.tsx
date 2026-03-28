"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppContext } from "@/lib/context";
import Link from "next/link";
import {
  fetchArticle,
  fetchBriefing,
  translateTexts,
  generateVideo,
  Article,
  BriefingResponse,
  VideoResponse,
} from "@/lib/api";
import { SentimentBadge } from "@/components/NewsCard";
import ChatInterface from "@/components/ChatInterface";
import {
  ArrowLeft,
  Clock,
  User,
  Tag,
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Globe,
  BookOpen,
  Film,
  Play,
  Pause,
  ChevronRight,
} from "lucide-react";

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { language, persona } = useAppContext();
  const articleId = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [briefing, setBriefing] = useState<BriefingResponse | null>(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [loadingBriefing, setLoadingBriefing] = useState(true);
  const [translatedArticle, setTranslatedArticle] = useState<{ language: string; article: Article } | null>(null);
  const [translatedContent, setTranslatedContent] = useState<{ language: string; content: string } | null>(null);
  const [translatedBriefingBullets, setTranslatedBriefingBullets] = useState<{ language: string; bullets: string[] } | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translatingContent, setTranslatingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Video state
  const [video, setVideo] = useState<VideoResponse | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [activeScene, setActiveScene] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);

  // Fetch article + briefing
  useEffect(() => {
    let cancelled = false;

    async function loadArticlePage() {
      setLoadingArticle(true);
      setLoadingBriefing(true);
      setError(null);
      setTranslatedArticle(null);
      setTranslatedContent(null);
      setTranslatedBriefingBullets(null);

      try {
        const [articleData, briefingData] = await Promise.allSettled([
          fetchArticle(articleId),
          fetchBriefing(articleId),
        ]);

        if (cancelled) return;

        if (articleData.status === "fulfilled") {
          setArticle(articleData.value);
        } else {
          setError(articleData.reason instanceof Error ? articleData.reason.message : "Article fetch failed");
        }

        if (briefingData.status === "fulfilled") {
          setBriefing(briefingData.value);
        } else {
          setBriefing(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingArticle(false);
          setLoadingBriefing(false);
        }
      }
    }

    void loadArticlePage();
    return () => {
      cancelled = true;
    };
  }, [articleId]);

  // Translate article + briefing on language change
  useEffect(() => {
    let cancelled = false;

    async function loadTranslation() {
      if (!article || language === "English") {
        setTranslatedArticle(null);
        setTranslatedContent(null);
        setTranslatedBriefingBullets(null);
        setTranslating(false);
        setTranslatingContent(false);
        return;
      }

      setTranslatedArticle(null);
      setTranslatedContent(null);
      setTranslatedBriefingBullets(null);
      setTranslating(true);
      setTranslatingContent(true);
      try {
        const articleTexts = [
          article.title,
          article.summary,
        ];
        const briefingTexts = briefing?.bullets ?? [];
        const res = await translateTexts([...articleTexts, ...briefingTexts], language);
        if (cancelled) return;

        const translations = res.translations.map((entry) => entry.translated);
        setTranslatedArticle({
          language,
          article: {
            ...article,
            title: translations[0] || article.title,
            summary: translations[1] || article.summary,
          },
        });
        setTranslatedBriefingBullets({
          language,
          bullets: briefingTexts.length > 0
            ? translations.slice(2, 2 + briefingTexts.length).map((bullet, index) => bullet || briefingTexts[index])
            : [],
        });
      } catch {
        if (!cancelled) {
          setTranslatedArticle(null);
          setTranslatedBriefingBullets(null);
        }
      } finally {
        if (!cancelled) setTranslating(false);
      }

      try {
        const contentRes = await translateTexts([article.content ?? ""], language);
        if (cancelled) return;
        setTranslatedContent({
          language,
          content: contentRes.translations[0]?.translated || article.content || "",
        });
      } catch {
        if (!cancelled) setTranslatedContent(null);
      } finally {
        if (!cancelled) setTranslatingContent(false);
      }
    }

    void loadTranslation();
    return () => {
      cancelled = true;
    };
  }, [article, briefing, language]);

  // Auto-advance video scenes
  useEffect(() => {
    if (!videoPlaying || !video) return;
    const scene = video.scenes[activeScene];
    const timer = setTimeout(() => {
      if (activeScene < video.scenes.length - 1) {
        setActiveScene((p) => p + 1);
      } else {
        setVideoPlaying(false);
        setActiveScene(0);
      }
    }, scene.duration * 200);
    return () => clearTimeout(timer);
  }, [videoPlaying, activeScene, video]);

  async function handleVideoGen() {
    setVideoLoading(true);
    setVideo(null);
    setActiveScene(0);
    setVideoPlaying(false);
    try {
      const res = await generateVideo(articleId);
      setVideo(res);
    } catch { /* handle error */ }
    setVideoLoading(false);
  }

  if (loadingArticle) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 size={32} className="animate-spin text-[var(--color-accent)]" />
        <p className="text-sm text-[var(--color-muted)]">Loading article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertCircle size={32} className="text-[var(--color-negative)]" />
        <p className="text-sm text-[var(--color-negative)]">Article not found</p>
        <button
          onClick={() => router.push("/")}
          className="text-sm text-[var(--color-accent)] hover:underline cursor-pointer"
        >
          &larr; Back to feed
        </button>
      </div>
    );
  }

  const translatedArticleForLanguage = translatedArticle?.language === language ? translatedArticle.article : null;
  const translatedContentForLanguage = translatedContent?.language === language ? translatedContent.content : null;
  const visibleArticle = {
    ...article,
    ...(translatedArticleForLanguage ?? {}),
    content: translatedContentForLanguage ?? article.content,
  };
  const visibleBriefingBullets = translatedBriefingBullets?.language === language
    ? translatedBriefingBullets.bullets
    : briefing?.bullets ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      {/* Back Button */}
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back to feed
      </button>

      {/* Article Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-accent)]">
            {article.category}
          </span>
          <SentimentBadge sentiment={article.sentiment} />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
          {visibleArticle.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-muted)]">
          <span className="flex items-center gap-1.5">
            <User size={14} />
            {visibleArticle.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            {new Date(article.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen size={14} />
            {Math.ceil((visibleArticle.content?.split(" ")?.length ?? 0) / 200)} min read
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {visibleArticle.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--color-surface)] rounded-lg text-xs text-[var(--color-muted)] font-mono border border-[var(--color-border)]"
            >
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>

        {visibleArticle.image_url && (
          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]">
            <img
              src={visibleArticle.image_url}
              alt={visibleArticle.title}
              className="h-[260px] w-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </header>

      {/* AI Briefing */}
      <section className="rounded-2xl bg-gradient-to-br from-[var(--color-accent)]/5 to-[var(--color-accent-secondary)]/5 border border-[var(--color-accent)]/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-[var(--color-accent)]" />
          <h2 className="text-base font-bold">AI Briefing</h2>
          {briefing && (
            <span className="ml-auto text-[11px] font-mono text-[var(--color-muted)] bg-[var(--color-surface)] px-2 py-0.5 rounded border border-[var(--color-border)]">
              Confidence: {Math.round(briefing.confidence * 100)}%
            </span>
          )}
        </div>

        {loadingBriefing ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-4 rounded" style={{ width: `${90 - i * 10}%` }} />
            ))}
          </div>
        ) : briefing ? (
          <>
            {/* Translation notice */}
            {language !== "English" && (
              <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-[var(--color-accent-secondary)]/10 border border-[var(--color-accent-secondary)]/20">
                <Globe size={14} className="text-[var(--color-accent-secondary)]" />
                {translating ? (
                  <span className="text-xs text-[var(--color-muted)] flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin" />
                    Translating to {language}...
                  </span>
                ) : translatedArticle?.language === language ? (
                  <span className="text-xs text-[var(--color-accent-secondary)]">
                    Culturally adapted {language} translation
                  </span>
                ) : null}
              </div>
            )}

            <ul className="space-y-3">
              {visibleBriefingBullets.map((bullet, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm leading-relaxed animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms`, animationFillMode: "backwards" }}
                >
                  <CheckCircle2
                    size={16}
                    className="flex-shrink-0 text-[var(--color-accent)] mt-0.5"
                  />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            {/* Sentiment analysis */}
            <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[var(--color-border-subtle)]">
              <Shield size={14} className="text-[var(--color-muted)]" />
              <span className="text-xs text-[var(--color-muted)]">
                Sentiment Analysis:
              </span>
              <SentimentBadge sentiment={briefing.sentiment} />
            </div>
          </>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">
            Failed to load AI briefing.
          </p>
        )}
      </section>

      {/* Full Article */}
      <section className="space-y-4">
        <h2 className="text-base font-bold flex items-center gap-2">
          <BookOpen size={18} className="text-[var(--color-muted)]" />
          Full Article
        </h2>
        <div className="text-sm text-[var(--color-foreground)]/80 leading-[1.8] whitespace-pre-line">
          {language !== "English" && translatingContent && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-muted)]">
              <Loader2 size={12} className="animate-spin" />
              Translating full article to {language}...
            </div>
          )}
          {visibleArticle.content}
        </div>
      </section>

      {/* AI Video Studio (inline) */}
      <section className="rounded-2xl bg-gradient-to-br from-[var(--color-accent-secondary)]/5 to-[var(--color-surface)] border border-[var(--color-accent-secondary)]/20 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film size={18} className="text-[var(--color-accent-secondary)]" />
            <h2 className="text-base font-bold">AI Video</h2>
          </div>
          {!video && (
            <button
              onClick={handleVideoGen}
              disabled={videoLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent-secondary)] text-white text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {videoLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Generate Video
                </>
              )}
            </button>
          )}
        </div>

        {!video && !videoLoading && (
          <p className="text-xs text-[var(--color-muted)]">
            Transform this article into a 90-second AI-narrated video with animated data visuals.
          </p>
        )}

        {videoLoading && (
          <div className="flex flex-col items-center py-8 gap-3">
            <Loader2 size={28} className="animate-spin text-[var(--color-accent-secondary)]" />
            <p className="text-xs text-[var(--color-muted)]">Composing narration, charts, and animations...</p>
            <div className="w-40 h-1 bg-[var(--color-surface)] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-secondary)] rounded-full animate-pulse" style={{ width: "65%" }} />
            </div>
          </div>
        )}

        {video && (
          <div className="space-y-3 animate-fade-in-up">
            {/* Mini player */}
            <div className="relative rounded-xl overflow-hidden border border-[var(--color-border)] min-h-[220px]">
              {video.scenes[activeScene]?.image_url ? (
                <img
                  src={video.scenes[activeScene]?.image_url}
                  alt={video.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25" />
              <div className="relative flex min-h-[220px] flex-col items-center justify-center p-6 text-center">
              <p className="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)]/80 mb-2">
                {video.scenes[activeScene]?.type}
              </p>
              <p className="text-sm font-semibold max-w-md leading-relaxed text-white">
                {video.scenes[activeScene]?.narration}
              </p>
              <p className="mt-3 text-[11px] text-white/70 max-w-md">
                {video.scenes[activeScene]?.visual}
              </p>
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => setVideoPlaying(!videoPlaying)}
                  className="w-8 h-8 rounded-full bg-[var(--color-accent-secondary)] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {videoPlaying ? <Pause size={12} className="text-white" /> : <Play size={12} className="text-white ml-0.5" />}
                </button>
                <div className="flex gap-0.5">
                  {video.scenes.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setActiveScene(i); setVideoPlaying(false); }}
                      className={`w-6 h-1 rounded-full cursor-pointer transition-all ${
                        i === activeScene ? "bg-[var(--color-accent-secondary)]" : i < activeScene ? "bg-[var(--color-accent-secondary)]/40" : "bg-white/15"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-mono text-[var(--color-muted)]">
                  {video.scenes[activeScene]?.timestamp} / 1:30
                </span>
              </div>
              </div>
            </div>
            <Link href="/video" className="flex items-center gap-1 text-xs text-[var(--color-accent-secondary)] hover:underline">
              Open full Video Studio <ChevronRight size={12} />
            </Link>
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold">Story Arc Tracker</h2>
            <p className="text-sm text-[var(--color-muted)] mt-1">
              Build a related-coverage timeline for this specific article instead of viewing a static global arc.
            </p>
          </div>
          <Link
            href={`/story-arc?articleId=${article.id}&persona=${persona}`}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 px-4 py-2 text-xs font-semibold text-[var(--color-accent)] hover:opacity-80"
          >
            Open story arc <ChevronRight size={12} />
          </Link>
        </div>
      </section>

      {/* Chat */}
      <section className="space-y-4">
        <ChatInterface contextId={article.id} articleTitle={visibleArticle.title} />
      </section>
    </div>
  );
}
