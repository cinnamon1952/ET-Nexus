"use client";

import React from "react";
import Link from "next/link";
import { Article } from "@/lib/api";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  ArrowRight,
  Tag,
} from "lucide-react";

interface Props {
  article: Article;
  index: number;
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const config = {
    positive: {
      icon: TrendingUp,
      label: "Bullish",
      bg: "bg-[var(--color-positive)]/10",
      text: "text-[var(--color-positive)]",
      border: "border-[var(--color-positive)]/30",
    },
    negative: {
      icon: TrendingDown,
      label: "Bearish",
      bg: "bg-[var(--color-negative)]/10",
      text: "text-[var(--color-negative)]",
      border: "border-[var(--color-negative)]/30",
    },
    neutral: {
      icon: Minus,
      label: "Neutral",
      bg: "bg-[var(--color-neutral-badge)]/10",
      text: "text-[var(--color-neutral-badge)]",
      border: "border-[var(--color-neutral-badge)]/30",
    },
  };
  const c = config[sentiment as keyof typeof config] || config.neutral;
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${c.bg} ${c.text} ${c.border}`}
    >
      <Icon size={11} />
      {c.label}
    </span>
  );
}

export { SentimentBadge };

export default function NewsCard({ article, index }: Props) {
  return (
    <Link href={`/article/${article.id}`}>
      <div
        className="card-glow group relative overflow-hidden rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] cursor-pointer transition-all duration-300 hover:bg-[var(--color-surface)] hover:translate-y-[-2px] hover:shadow-xl hover:shadow-black/30 animate-fade-in-up"
        style={{ animationDelay: `${index * 80}ms`, animationFillMode: "backwards" }}
      >
        {article.image_url && (
          <div className="relative h-44 overflow-hidden border-b border-[var(--color-border)]">
            <img
              src={article.image_url}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
          </div>
        )}

        <div className="p-5">
        {/* Category & Sentiment Row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-accent)]">
            {article.category}
          </span>
          <SentimentBadge sentiment={article.sentiment} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold leading-snug text-[var(--color-foreground)] group-hover:text-[var(--color-accent)] transition-colors duration-200 mb-2">
          {article.title}
        </h3>

        {/* Summary */}
        <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4 line-clamp-3">
          {article.summary}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {article.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--color-surface)] rounded-md text-[11px] text-[var(--color-muted)] font-mono"
            >
              <Tag size={9} />
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-3 text-xs text-[var(--color-muted)]">
            <span className="font-medium text-[var(--color-foreground)]/70">
              {article.author}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {new Date(article.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs text-[var(--color-accent)] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Read
            <ArrowRight size={12} />
          </span>
        </div>
        </div>
      </div>
    </Link>
  );
}
