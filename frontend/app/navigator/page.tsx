"use client";

import React, { useState } from "react";
import { useAppContext } from "@/lib/context";
import { fetchNavigator, NavigatorResponse } from "@/lib/api";
import {
  Compass,
  Search,
  Loader2,
  Sparkles,
  BarChart3,
  MessageSquare,
  FileText,
  ChevronRight,
  ArrowRight,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import Link from "next/link";

const suggestedTopics = [
  "AI in Finance",
  "Market Contagion",
  "Algorithmic Trading",
  "Fintech India",
  "Venture Capital 2026",
  "Synthetic Data",
];

export default function NavigatorPage() {
  const { persona } = useAppContext();
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<NavigatorResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(searchTopic?: string) {
    const t = searchTopic || topic.trim();
    if (!t) return;
    setTopic(t);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetchNavigator(t, persona);
      setResult(res);
    } catch { /* handle error */ }
    setLoading(false);
  }

  const sentimentIcon = (s: string) => {
    if (s === "positive") return <TrendingUp size={12} className="text-[var(--color-positive)]" />;
    if (s === "negative") return <TrendingDown size={12} className="text-[var(--color-negative)]" />;
    return <Minus size={12} className="text-[var(--color-neutral-badge)]" />;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-accent)]/10 to-[var(--color-accent-secondary)]/10 border border-[var(--color-accent)]/20 p-8 animate-fade-in-up">
        <div className="relative text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center mx-auto">
            <Compass size={32} className="text-[var(--color-accent)]" />
          </div>
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            News Navigator <Sparkles size={18} className="text-[var(--color-accent)]" />
          </h1>
          <p className="text-sm text-[var(--color-muted)] max-w-lg mx-auto">
            Instead of reading 8 separate articles, get a single AI-synthesized deep briefing that explores any topic across all ET Nexus coverage.
          </p>
        </div>
      </header>

      {/* Search */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter a topic to explore (e.g., AI in Finance, Market Contagion)..."
              className="w-full pl-10 pr-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-foreground)] placeholder-[var(--color-muted)] focus:outline-none focus:border-[var(--color-accent)]/50 focus:ring-1 focus:ring-[var(--color-accent)]/20 transition-all"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={!topic.trim() || loading}
            className="px-6 py-3 bg-[var(--color-accent)] rounded-xl text-sm font-semibold text-white hover:bg-[var(--color-accent)]/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2"
          >
            <Sparkles size={14} /> Explore
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedTopics.map((t) => (
            <button
              key={t}
              onClick={() => handleSearch(t)}
              className="px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/30 transition-colors cursor-pointer"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 size={32} className="animate-spin text-[var(--color-accent)]" />
          <p className="text-sm text-[var(--color-foreground)] font-medium">Synthesizing coverage...</p>
          <p className="text-xs text-[var(--color-muted)]">Analysing articles, extracting insights, building deep briefing</p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Executive Summary */}
          <section className="rounded-2xl bg-gradient-to-br from-[var(--color-accent)]/5 to-[var(--color-accent-secondary)]/5 border border-[var(--color-accent)]/20 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-[var(--color-accent)]" />
              <h2 className="text-base font-bold">{result.synthesis.headline}</h2>
              <span className="ml-auto text-[11px] font-mono text-[var(--color-muted)] bg-[var(--color-surface)] px-2 py-0.5 rounded border border-[var(--color-border)]">
                {result.article_count} articles
              </span>
            </div>
            <p className="text-sm text-[var(--color-foreground)]/80 leading-relaxed">
              {result.synthesis.executive_summary}
            </p>
          </section>

          {/* Key Findings */}
          <section>
            <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-widest mb-3 flex items-center gap-2">
              <BarChart3 size={14} /> Key Findings
            </h2>
            <div className="space-y-2">
              {result.synthesis.key_findings.map((finding, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] text-sm leading-relaxed animate-fade-in-up"
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: "backwards" }}
                >
                  {finding}
                </div>
              ))}
            </div>
          </section>

          {/* Source Articles */}
          <section>
            <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-widest mb-3 flex items-center gap-2">
              <FileText size={14} /> Source Articles
            </h2>
            <div className="space-y-2">
              {result.source_articles.map((article, i) => (
                <Link href={`/article/${article.id}`} key={article.id}>
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] hover:border-[var(--color-accent)]/20 transition-all cursor-pointer animate-fade-in-up"
                    style={{ animationDelay: `${i * 60}ms`, animationFillMode: "backwards" }}
                  >
                    {sentimentIcon(article.sentiment)}
                    <span className="text-sm flex-1">{article.title}</span>
                    <span className="text-[11px] font-mono text-[var(--color-muted)]">{article.date}</span>
                    <ChevronRight size={14} className="text-[var(--color-muted)]" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Follow-up Questions */}
          <section>
            <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-widest mb-3 flex items-center gap-2">
              <Lightbulb size={14} /> Explore Further
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.synthesis.follow_up_questions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSearch(q)}
                  className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] text-left hover:border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/5 transition-all cursor-pointer text-sm animate-fade-in-up"
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: "backwards" }}
                >
                  <MessageSquare size={14} className="text-[var(--color-accent)] flex-shrink-0" />
                  <span className="flex-1">{q}</span>
                  <ArrowRight size={12} className="text-[var(--color-muted)]" />
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
