"use client";

import React, { useEffect, useState } from "react";
import { useAppContext } from "@/lib/context";
import { fetchFeed, generateVideo, Article, VideoResponse } from "@/lib/api";
import {
  Video,
  Play,
  Pause,
  Loader2,
  Clock,
  Film,
  Volume2,
  Music,
  ChevronRight,
  Sparkles,
  BarChart3,
} from "lucide-react";

export default function VideoStudioPage() {
  const { persona } = useAppContext();
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [video, setVideo] = useState<VideoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedLoading, setFeedLoading] = useState(true);
  const [activeScene, setActiveScene] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadFeed() {
      setFeedLoading(true);
      try {
        const data = await fetchFeed(persona);
        if (!cancelled) setArticles(data.articles);
      } finally {
        if (!cancelled) setFeedLoading(false);
      }
    }

    void loadFeed();
    return () => {
      cancelled = true;
    };
  }, [persona]);

  // Auto-advance scenes when playing
  useEffect(() => {
    if (!playing || !video) return;
    const scene = video.scenes[activeScene];
    const timer = setTimeout(() => {
      if (activeScene < video.scenes.length - 1) {
        setActiveScene((p) => p + 1);
      } else {
        setPlaying(false);
        setActiveScene(0);
      }
    }, scene.duration * 200); // Speed up for demo (200ms per second)
    return () => clearTimeout(timer);
  }, [playing, activeScene, video]);

  async function handleGenerate(articleId: string) {
    setSelectedId(articleId);
    setLoading(true);
    setVideo(null);
    setActiveScene(0);
    setPlaying(false);
    try {
      const res = await generateVideo(articleId);
      setVideo(res);
    } catch {
      // handle error silently
    }
    setLoading(false);
  }

  const sceneColors: Record<string, string> = {
    intro: "var(--color-accent)",
    context: "var(--color-accent-secondary)",
    analysis: "var(--color-positive)",
    data: "var(--color-neutral-badge)",
    outlook: "var(--color-accent)",
    outro: "var(--color-muted)",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-accent-secondary)]/10 to-[var(--color-surface)] border border-[var(--color-accent-secondary)]/20 p-8 animate-fade-in-up">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle, var(--color-accent-secondary) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }} />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent-secondary)]/10 border border-[var(--color-accent-secondary)]/20 flex items-center justify-center">
            <Film size={28} className="text-[var(--color-accent-secondary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              AI News Video Studio <Sparkles size={18} className="text-[var(--color-accent-secondary)]" />
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              Transform any article into a broadcast-quality AI video with narration, data visuals, and animated overlays.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Article Selector */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-widest flex items-center gap-2">
            <Video size={14} /> Select Article
          </h2>
          {feedLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-[var(--color-accent)]" />
            </div>
          ) : (
            <div className="space-y-2">
              {articles.map((a) => (
                <button
                  key={a.id}
                  onClick={() => handleGenerate(a.id)}
                  className={`w-full overflow-hidden text-left rounded-xl border transition-all duration-200 cursor-pointer ${
                    selectedId === a.id
                      ? "border-[var(--color-accent-secondary)] bg-[var(--color-accent-secondary)]/10"
                      : "border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-accent-secondary)]/30"
                  }`}
                >
                  {a.image_url && (
                    <div className="h-28 border-b border-[var(--color-border)]">
                      <img
                        src={a.image_url}
                        alt={a.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-accent)] mb-1">
                      {a.category}
                    </p>
                    <p className="text-sm font-bold leading-snug line-clamp-2">{a.title}</p>
                    <p className="text-[11px] text-[var(--color-muted)] mt-1">{a.author} • {a.date}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Video Preview */}
        <div className="lg:col-span-2">
          {!selectedId && (
            <div className="flex flex-col items-center justify-center h-96 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-card)]">
              <Film size={48} className="text-[var(--color-muted)] mb-4 opacity-30" />
              <p className="text-sm text-[var(--color-muted)]">Select an article to generate a video</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-96 rounded-2xl border border-[var(--color-accent-secondary)]/20 bg-[var(--color-card)]">
              <Loader2 size={40} className="animate-spin text-[var(--color-accent-secondary)] mb-4" />
              <p className="text-sm text-[var(--color-foreground)] font-medium">Generating AI Video...</p>
              <p className="text-xs text-[var(--color-muted)] mt-1">Composing narration, charts, and animations</p>
              <div className="w-48 h-1.5 bg-[var(--color-surface)] rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-secondary)] rounded-full animate-pulse" style={{ width: "70%" }} />
              </div>
            </div>
          )}

          {video && !loading && (
            <div className="space-y-4 animate-fade-in-up">
              {/* Video Player Mock */}
              <div className="relative rounded-2xl overflow-hidden border border-[var(--color-border)] aspect-video">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />
                {/* Scene Visual */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <div
                    className="text-xs font-mono uppercase tracking-widest mb-3 px-3 py-1 rounded-full border"
                    style={{
                      color: sceneColors[video.scenes[activeScene]?.type] || "var(--color-accent)",
                      borderColor: sceneColors[video.scenes[activeScene]?.type] || "var(--color-accent)",
                      backgroundColor: `${sceneColors[video.scenes[activeScene]?.type] || "var(--color-accent)"}15`,
                    }}
                  >
                    {video.scenes[activeScene]?.type}
                  </div>
                  <p className="text-lg font-bold max-w-md leading-relaxed mb-4">
                    {video.scenes[activeScene]?.narration}
                  </p>
                  <p className="text-xs text-white/70 max-w-sm">
                    {video.scenes[activeScene]?.visual}
                  </p>
                </div>

                {/* Top bar */}
                <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
                  <span className="text-[10px] font-mono text-white/60">ET NEXUS • AI VIDEO</span>
                  <span className="text-[10px] font-mono text-white/60">{video.resolution} • {video.format}</span>
                </div>

                {/* Bottom controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                  {/* Progress bar */}
                  <div className="flex gap-1 mb-3">
                    {video.scenes.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { setActiveScene(i); setPlaying(false); }}
                        className={`flex-1 h-1 rounded-full transition-all cursor-pointer ${
                          i === activeScene ? "bg-[var(--color-accent)]" : i < activeScene ? "bg-[var(--color-accent)]/50" : "bg-white/20"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setPlaying(!playing)}
                        className="w-10 h-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center hover:bg-[var(--color-accent)]/80 cursor-pointer transition-all"
                      >
                        {playing ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white ml-0.5" />}
                      </button>
                      <span className="text-xs text-white/70 font-mono">
                        {video.scenes[activeScene]?.timestamp} / 1:30
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-white/50">
                      <Volume2 size={14} />
                      <Music size={14} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)]">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-muted)] mb-1">Duration</p>
                  <p className="text-sm font-bold flex items-center gap-1"><Clock size={13} /> {video.duration_seconds}s</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)]">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-muted)] mb-1">Scenes</p>
                  <p className="text-sm font-bold flex items-center gap-1"><Film size={13} /> {video.scenes.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)]">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-muted)] mb-1">Data Visuals</p>
                  <p className="text-sm font-bold flex items-center gap-1"><BarChart3 size={13} /> {video.data_visuals.length}</p>
                </div>
              </div>

              {/* Scene List */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-widest">Storyboard</h3>
                {video.scenes.map((scene, i) => (
                  <button
                    key={i}
                    onClick={() => { setActiveScene(i); setPlaying(false); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left cursor-pointer ${
                      i === activeScene
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
                        : "border-[var(--color-border)] bg-[var(--color-card)] hover:bg-[var(--color-surface)]"
                    }`}
                  >
                    {scene.image_url ? (
                      <img
                        src={scene.image_url}
                        alt={scene.type}
                        className="h-12 w-16 rounded-lg object-cover border border-[var(--color-border)]"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-12 w-16 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" />
                    )}
                    <span className="text-xs font-mono text-[var(--color-muted)] w-8">{scene.timestamp}</span>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{
                        color: sceneColors[scene.type] || "var(--color-accent)",
                        backgroundColor: `${sceneColors[scene.type] || "var(--color-accent)"}15`,
                      }}
                    >
                      {scene.type}
                    </span>
                    <span className="text-sm flex-1 line-clamp-1">{scene.narration}</span>
                    <span className="text-xs text-[var(--color-muted)]">{scene.duration}s</span>
                    <ChevronRight size={14} className="text-[var(--color-muted)]" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
