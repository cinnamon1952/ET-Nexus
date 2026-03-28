"use client";

import React, { useState, useRef, useEffect } from "react";
import { sendChat } from "@/lib/api";
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

interface Props {
  contextId: string;
  articleTitle: string;
}

export default function ChatInterface({ contextId, articleTitle }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded]);

  async function handleSend() {
    const q = input.trim();
    if (!q || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setLoading(true);

    try {
      const res = await sendChat(q, contextId);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.response, sources: res.sources },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process that request. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--color-accent-secondary)]/10 border border-[var(--color-accent)]/20 hover:border-[var(--color-accent)]/50 transition-all duration-300 group cursor-pointer"
      >
        <Sparkles size={18} className="text-[var(--color-accent)] group-hover:animate-pulse" />
        <span className="text-sm font-semibold text-[var(--color-foreground)]">
          Ask AI about this article
        </span>
        <MessageSquare size={16} className="text-[var(--color-muted)]" />
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <Bot size={18} className="text-[var(--color-accent)]" />
        <span className="text-sm font-semibold">AI Assistant</span>
        <span className="text-[11px] text-[var(--color-muted)] ml-auto font-mono">
          context: {articleTitle.slice(0, 30)}...
        </span>
      </div>

      {/* Messages */}
      <div className="h-72 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
            <Sparkles size={32} className="text-[var(--color-accent)]" />
            <p className="text-sm text-[var(--color-muted)] max-w-xs">
              Ask me anything about this article. I can explain concepts, analyse implications, or
              connect it to broader market trends.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {["What are the key risks?", "Explain the implications", "How does this affect markets?"].map(
                (q) => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); inputRef.current?.focus(); }}
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/30 transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 animate-slide-in-right ${msg.role === "user" ? "justify-end" : ""}`}
            style={{ animationDelay: "50ms" }}
          >
            {msg.role === "assistant" && (
              <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center">
                <Bot size={14} className="text-[var(--color-accent)]" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[var(--color-accent)] text-white rounded-br-none"
                  : "bg-[var(--color-surface)] text-[var(--color-foreground)] rounded-bl-none"
              }`}
            >
              {msg.content}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10 text-[11px] opacity-70">
                  Source: {msg.sources[0]}
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[var(--color-accent-secondary)]/10 flex items-center justify-center">
                <User size={14} className="text-[var(--color-accent-secondary)]" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center">
              <Bot size={14} className="text-[var(--color-accent)]" />
            </div>
            <div className="bg-[var(--color-surface)] rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-[var(--color-accent)]" />
              <span className="text-sm text-[var(--color-muted)]">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[var(--color-border)] p-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about this article..."
            className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-foreground)] placeholder-[var(--color-muted)] focus:outline-none focus:border-[var(--color-accent)]/50 focus:ring-1 focus:ring-[var(--color-accent)]/20 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--color-accent)] flex items-center justify-center hover:bg-[var(--color-accent)]/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
