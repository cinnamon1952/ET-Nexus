"use client";

import React, { useEffect, useState } from "react";
import { fetchStoryArcs, fetchStoryArc, StoryArcSummary, StoryArc } from "@/lib/api";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Minus,
  Users,
  Eye,
  Sparkles,
  Target,
  Activity,
  ChevronRight,
  Compass,
} from "lucide-react";

const sentimentConfig: Record<string, { icon: typeof TrendingUp; color: string; label: string }> = {
  positive: { icon: TrendingUp, color: "var(--color-positive)", label: "Bullish" },
  negative: { icon: TrendingDown, color: "var(--color-negative)", label: "Bearish" },
  neutral: { icon: Minus, color: "var(--color-neutral-badge)", label: "Neutral" },
  warning: { icon: AlertTriangle, color: "var(--color-neutral-badge)", label: "Caution" },
};

export default function StoryArcPage() {
  const [arcs, setArcs] = useState<StoryArcSummary[]>([]);
  const [selectedArc, setSelectedArc] = useState<StoryArc | null>(null);
  const [loading, setLoading] = useState(true);
  const [arcLoading, setArcLoading] = useState(false);

  useEffect(() => {
    fetchStoryArcs()
      .then((data) => { setArcs(data.arcs); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function loadArc(arcId: string) {
    setArcLoading(true);
    try {
      const arc = await fetchStoryArc(arcId);
      setSelectedArc(arc);
    } catch { /* handle error */ }
    setArcLoading(false);
  }

  // Load first arc by default
  useEffect(() => {
    if (arcs.length > 0 && !selectedArc) {
      loadArc(arcs[0].id);
    }
  }, [arcs]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-negative)]/5 to-[var(--color-positive)]/5 border border-[var(--color-border)] p-8 animate-fade-in-up">
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center">
            <Compass size={28} className="text-[var(--color-accent)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Story Arc Tracker <Activity size={18} className="text-[var(--color-accent)]" />
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              Interactive timelines with key players, sentiment tracking, and AI predictions.
            </p>
          </div>
        </div>
      </header>

      {/* Arc Selector */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-[var(--color-accent)]" />
        </div>
      ) : (
        <>
          <div className="flex gap-3">
            {arcs.map((arc) => (
              <button
                key={arc.id}
                onClick={() => loadArc(arc.id)}
                className={`flex-1 p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedArc?.id === arc.id
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
                    : "border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-accent)]/30"
                }`}
              >
                <h3 className="text-sm font-bold mb-1">{arc.title}</h3>
                <p className="text-xs text-[var(--color-muted)] line-clamp-2 mb-2">{arc.description}</p>
                <div className="flex items-center gap-3 text-[11px] text-[var(--color-muted)]">
                  <span className="flex items-center gap-1"><Activity size={11} /> {arc.event_count} events</span>
                  <span className="flex items-center gap-1"><Users size={11} /> {arc.player_count} players</span>
                </div>
              </button>
            ))}
          </div>

          {/* Arc Detail */}
          {arcLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-[var(--color-accent)]" />
            </div>
          )}

          {selectedArc && !arcLoading && (
            <div className="space-y-8 animate-fade-in-up">
              {/* Timeline */}
              <section>
                <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Activity size={14} /> Timeline
                </h2>
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--color-negative)] via-[var(--color-neutral-badge)] to-[var(--color-positive)]" />

                  <div className="space-y-4">
                    {selectedArc.events.map((event, i) => {
                      const config = sentimentConfig[event.sentiment] || sentimentConfig.neutral;
                      const Icon = config.icon;
                      return (
                        <div
                          key={i}
                          className="relative pl-14 animate-fade-in-up"
                          style={{ animationDelay: `${i * 100}ms`, animationFillMode: "backwards" }}
                        >
                          {/* Node */}
                          <div
                            className="absolute left-0 w-10 h-10 rounded-xl flex items-center justify-center border"
                            style={{
                              backgroundColor: `${config.color}15`,
                              borderColor: `${config.color}40`,
                            }}
                          >
                            <Icon size={18} style={{ color: config.color }} />
                          </div>

                          {/* Card */}
                          <div className="rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] p-4 hover:translate-x-1 transition-transform duration-200">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-[11px] font-mono text-[var(--color-muted)]">{event.date}</span>
                              <span
                                className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                                style={{ color: config.color, backgroundColor: `${config.color}15` }}
                              >
                                {config.label}
                              </span>
                              <span className="text-[11px] text-[var(--color-muted)] ml-auto flex items-center gap-1">
                                Impact: <strong style={{ color: config.color }}>{event.impact_score}/10</strong>
                              </span>
                            </div>
                            <h4 className="text-sm font-bold mb-1">{event.title}</h4>
                            <p className="text-xs text-[var(--color-muted)] leading-relaxed">{event.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Sentiment Chart */}
              <section>
                <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <TrendingUp size={14} /> Sentiment Trajectory
                </h2>
                <div className="rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] p-6">
                  <div className="flex items-end gap-2 h-32">
                    {selectedArc.sentiment_trajectory.map((point, i) => {
                      const normalized = (point.score + 1) / 2; // -1..1 → 0..1
                      const height = Math.max(normalized * 100, 5);
                      const color = point.score > 0 ? "var(--color-positive)" : point.score < -0.3 ? "var(--color-negative)" : "var(--color-neutral-badge)";
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[10px] font-mono" style={{ color }}>{point.score > 0 ? "+" : ""}{point.score}</span>
                          <div
                            className="w-full rounded-t-lg transition-all duration-500"
                            style={{
                              height: `${height}%`,
                              backgroundColor: `${color}30`,
                              borderTop: `3px solid ${color}`,
                              animationDelay: `${i * 100}ms`,
                            }}
                          />
                          <span className="text-[9px] text-[var(--color-muted)] font-mono">
                            {point.date.split("-").slice(1).join("/")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Key Players */}
                <section>
                  <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Users size={14} /> Key Players
                  </h2>
                  <div className="space-y-2">
                    {selectedArc.key_players.map((player, i) => {
                      const config = sentimentConfig[player.sentiment] || sentimentConfig.neutral;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] animate-fade-in-up"
                          style={{ animationDelay: `${i * 80}ms`, animationFillMode: "backwards" }}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: `${config.color}15`, color: config.color }}
                          >
                            {player.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{player.name}</p>
                            <p className="text-xs text-[var(--color-muted)] truncate">{player.role}</p>
                          </div>
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded"
                            style={{ color: config.color, backgroundColor: `${config.color}15` }}
                          >
                            {config.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Predictions */}
                <section>
                  <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Eye size={14} /> What to Watch Next
                  </h2>
                  <div className="space-y-2">
                    {selectedArc.predictions.map((pred, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-[var(--color-accent)]/5 to-[var(--color-accent-secondary)]/5 border border-[var(--color-accent)]/10 animate-fade-in-up"
                        style={{ animationDelay: `${i * 100}ms`, animationFillMode: "backwards" }}
                      >
                        <Target size={14} className="text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
                        <p className="text-sm leading-relaxed">{pred}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
