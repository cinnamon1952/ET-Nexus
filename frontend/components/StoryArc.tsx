"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Article, fetchStoryArc, StoryArc as StoryArcDetail } from "@/lib/api";
import { Persona } from "@/lib/context";
import {
  TrendingDown,
  TrendingUp,
  Shield,
  Minus,
  Loader2,
  ChevronRight,
} from "lucide-react";

interface Props {
  articles: Article[];
  persona: Persona;
}

const sentimentConfig = {
  positive: {
    icon: TrendingUp,
    color: "var(--color-positive)",
    bg: "bg-[var(--color-positive)]/10",
    border: "border-[var(--color-positive)]/30",
    label: "Bullish",
  },
  negative: {
    icon: TrendingDown,
    color: "var(--color-negative)",
    bg: "bg-[var(--color-negative)]/10",
    border: "border-[var(--color-negative)]/30",
    label: "Bearish",
  },
  neutral: {
    icon: Minus,
    color: "var(--color-neutral-badge)",
    bg: "bg-[var(--color-neutral-badge)]/10",
    border: "border-[var(--color-neutral-badge)]/30",
    label: "Neutral",
  },
};

export default function StoryArc({ articles, persona }: Props) {
  const featuredArticles = useMemo(() => articles.slice(0, 3), [articles]);
  const [manualSelectedId, setManualSelectedId] = useState<string | null>(null);
  const [storyArc, setStoryArc] = useState<StoryArcDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const selectedId = useMemo(() => {
    if (manualSelectedId && featuredArticles.some((article) => article.id === manualSelectedId)) {
      return manualSelectedId;
    }
    return featuredArticles[0]?.id ?? null;
  }, [featuredArticles, manualSelectedId]);

  useEffect(() => {
    if (!selectedId) return;

    let cancelled = false;

    async function loadStoryArc() {
      setLoading(true);
      try {
        const data = await fetchStoryArc(selectedId, persona);
        if (!cancelled) setStoryArc(data);
      } catch {
        if (!cancelled) setStoryArc(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadStoryArc();

    return () => {
      cancelled = true;
    };
  }, [selectedId, persona]);

  if (!featuredArticles.length) {
    return null;
  }

  return (
    <section className="relative py-10">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Shield size={20} className="text-[var(--color-accent)]" />
          <h2 className="text-lg font-bold">Story Arc</h2>
          <span className="text-xs text-[var(--color-muted)] font-mono bg-[var(--color-surface)] px-2 py-0.5 rounded">
            Live article-linked
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {featuredArticles.map((article) => (
            <button
              key={article.id}
              onClick={() => setManualSelectedId(article.id)}
              className={`max-w-sm rounded-full px-3 py-1.5 text-left text-xs border transition-colors cursor-pointer ${
                selectedId === article.id
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                  : "border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted)] hover:border-[var(--color-accent)]/30"
              }`}
            >
              <span className="line-clamp-1">{article.title}</span>
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-6">
          <Loader2 size={18} className="animate-spin text-[var(--color-accent)]" />
          <span className="text-sm text-[var(--color-muted)]">Building a story arc from related live articles...</span>
        </div>
      )}

      {storyArc && !loading && (
        <>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm font-bold">{storyArc.title}</p>
              <p className="text-xs text-[var(--color-muted)] max-w-2xl">{storyArc.description}</p>
            </div>
            <Link
              href={`/story-arc?articleId=${storyArc.id}&persona=${persona}`}
              className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline"
            >
              Open full tracker <ChevronRight size={12} />
            </Link>
          </div>

          <div className="relative">
            <div className="absolute top-6 left-0 right-0 h-px bg-gradient-to-r from-[var(--color-negative)] via-[var(--color-neutral-badge)] to-[var(--color-positive)] opacity-40" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {storyArc.events.slice(0, 4).map((event, i) => {
                const config = sentimentConfig[event.sentiment as keyof typeof sentimentConfig] || sentimentConfig.neutral;
                const Icon = config.icon;
                return (
                  <div
                    key={`${event.date}-${event.title}`}
                    className="animate-fade-in-up relative"
                    style={{
                      animationDelay: `${i * 150}ms`,
                      animationFillMode: "backwards",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center relative z-10`}
                      >
                        <Icon size={18} style={{ color: config.color }} />
                      </div>
                      <div>
                        <p className="text-[11px] font-mono text-[var(--color-muted)]">
                          {event.date}
                        </p>
                        <span
                          className="text-[10px] font-semibold uppercase tracking-wider"
                          style={{ color: config.color }}
                        >
                          {config.label}
                        </span>
                      </div>
                    </div>

                    <div className={`rounded-xl bg-[var(--color-card)] border ${config.border} p-4 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-black/20`}>
                      <h4 className="text-sm font-bold mb-2 leading-snug">
                        {event.title}
                      </h4>
                      <p className="text-xs text-[var(--color-muted)] leading-relaxed line-clamp-4">
                        {event.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
