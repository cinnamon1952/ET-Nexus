"use client";

import React from "react";
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Shield,
  Minus,
} from "lucide-react";

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  sentiment: "positive" | "negative" | "neutral" | "warning";
}

const events: TimelineEvent[] = [
  {
    date: "Mar 3, 2026",
    title: "Nasdaq Flash Anomaly",
    description:
      "Nasdaq-100 futures plunge 4.1% in 12 minutes before snapping back. Algorithmic cascades identified as primary amplifier.",
    sentiment: "negative",
  },
  {
    date: "Mar 10, 2026",
    title: "Vereinigte Kreditbank Disclosure",
    description:
      "German lender reveals €6.2B real-estate loss. Global sell-off begins within hours — Asian CDS spreads widen 120 bps.",
    sentiment: "negative",
  },
  {
    date: "Mar 15, 2026",
    title: "SEC Kill Switch Proposal",
    description:
      "SEC proposes Rule 15c3-7 mandating automated circuit-breakers for all algorithmic trading systems.",
    sentiment: "warning",
  },
  {
    date: "Mar 22, 2026",
    title: "Central Banks Deploy AI Simulations",
    description:
      "Five central banks pilot LLM-driven agent-based models to stress-test monetary policy before implementation.",
    sentiment: "positive",
  },
];

const sentimentConfig = {
  positive: {
    icon: TrendingUp,
    color: "var(--color-positive)",
    bg: "bg-[var(--color-positive)]/10",
    border: "border-[var(--color-positive)]/30",
    label: "Recovery",
  },
  negative: {
    icon: TrendingDown,
    color: "var(--color-negative)",
    bg: "bg-[var(--color-negative)]/10",
    border: "border-[var(--color-negative)]/30",
    label: "Shock",
  },
  warning: {
    icon: AlertTriangle,
    color: "var(--color-neutral-badge)",
    bg: "bg-[var(--color-neutral-badge)]/10",
    border: "border-[var(--color-neutral-badge)]/30",
    label: "Regulatory",
  },
  neutral: {
    icon: Minus,
    color: "var(--color-muted)",
    bg: "bg-[var(--color-surface)]",
    border: "border-[var(--color-border)]",
    label: "Neutral",
  },
};

export default function StoryArc() {
  return (
    <section className="relative py-10">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-8">
        <Shield size={20} className="text-[var(--color-accent)]" />
        <h2 className="text-lg font-bold">Story Arc</h2>
        <span className="text-xs text-[var(--color-muted)] font-mono bg-[var(--color-surface)] px-2 py-0.5 rounded">
          The Ripple Effects of Market Contagion
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute top-6 left-0 right-0 h-px bg-gradient-to-r from-[var(--color-negative)] via-[var(--color-neutral-badge)] to-[var(--color-positive)] opacity-40" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {events.map((event, i) => {
            const config = sentimentConfig[event.sentiment];
            const Icon = config.icon;
            return (
              <div
                key={i}
                className="animate-fade-in-up relative"
                style={{
                  animationDelay: `${i * 150}ms`,
                  animationFillMode: "backwards",
                }}
              >
                {/* Node */}
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
                      className={`text-[10px] font-semibold uppercase tracking-wider`}
                      style={{ color: config.color }}
                    >
                      {config.label}
                    </span>
                  </div>
                </div>

                {/* Card */}
                <div
                  className={`rounded-xl bg-[var(--color-card)] border ${config.border} p-4 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-black/20`}
                >
                  <h4 className="text-sm font-bold mb-2 leading-snug">
                    {event.title}
                  </h4>
                  <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
