"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, ArrowUpRight, TrendingUp, DollarSign, Brain } from "lucide-react";
import { aiMessages, suggestedQuestions } from "@/lib/data/mockData";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

const AI_RESPONSES: Record<string, string> = {
  "Where did most of my money go this month?":
    "Your top spending categories this month:\n\n1. **Housing** — $2,100 (33.2%)\n2. **Groceries** — $491 (7.7%)\n3. **Shopping** — $319 (5.0%) ⚠️ Over budget\n4. **Dining** — $284 (4.5%)\n5. **Utilities** — $233 (3.7%)\n\nHousing is your dominant expense at a third of your spending, which is within the recommended 30% guideline if we compare to income. Shopping is the one area to watch — you're $119 over your $200 budget.",
  "Am I on track with my budget?":
    "Mostly yes! Here's the status:\n\n✅ **On track** (8 categories): Housing, Groceries, Dining, Transport, Entertainment, Health, Software, Utilities\n\n⚠️ **Over budget** (1 category): Shopping is $119 over ($319 vs $200 budget)\n\nYou're 8 days into the remaining part of September — I'd suggest pausing discretionary shopping to close the gap. Overall you've used **86.4% of your total budget** with approximately **11 days** left in the month.",
  "How much am I saving each month?":
    "Here's your savings picture:\n\n**This month (Sep):** $6,386 saved\n- Income: $12,720\n- Expenses: $6,334\n- Savings rate: **50.2%** 🎉\n\n**6-month average:** $4,480/month (41.3% rate)\n\nYou're having an exceptionally good month — your savings rate is nearly 9 percentage points above your 6-month average. The main driver is a higher income month from Stripe payouts and freelance work. Keep it up!",
};

function formatMessage(content: string) {
  const lines = content.split("\n");
  return lines.map((line, i) => {
    const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    return <div key={i} style={{ marginBottom: line === "" ? 6 : 2 }} dangerouslySetInnerHTML={{ __html: formatted }} />;
  });
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(aiMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content || loading) return;
    setInput("");

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    await new Promise((r) => setTimeout(r, 1200));

    const reply =
      AI_RESPONSES[content] ||
      `Great question! Based on your September 2026 financial data, I can see your net worth stands at **$124,760** with a savings rate of **50.2%** this month.\n\nFor "${content}", I'd recommend reviewing your transaction history in the Analytics section for deeper insights. Your spending patterns look generally healthy with one exception: Shopping is slightly over budget.\n\nIs there a specific aspect of your finances you'd like me to analyze in more detail?`;

    const aiMsg: Message = {
      id: Date.now() + 1,
      role: "assistant",
      content: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 1px)", flexDirection: "column" }}>
      {/* Header */}
      <div
        style={{
          padding: "20px 32px",
          borderBottom: "1px solid var(--border)",
          background: "var(--card)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Sparkles size={18} color="white" />
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 17, fontWeight: 700, color: "var(--foreground)" }}>
            FinSight AI
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--positive)" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--positive)" }} />
            Online · Analyzing your September 2026 data
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {[
            { icon: DollarSign, label: "$12,720 income" },
            { icon: ArrowUpRight, label: "50.2% savings" },
            { icon: TrendingUp, label: "$124,760 NW" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 10px",
                borderRadius: 7,
                background: "var(--secondary)",
                border: "1px solid var(--border)",
                fontSize: 11,
                color: "var(--muted-foreground)",
                fontWeight: 500,
              }}
            >
              <Icon size={11} /> {label}
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              gap: 12,
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "100%",
            }}
          >
            {msg.role === "assistant" && (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  flexShrink: 0,
                  background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 2,
                }}
              >
                <Sparkles size={15} color="white" />
              </div>
            )}
            <div style={{ maxWidth: "70%" }}>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
                  background: msg.role === "user" ? "var(--primary)" : "var(--card)",
                  border: msg.role === "user" ? "none" : "1px solid var(--border)",
                  fontSize: 14,
                  color: msg.role === "user" ? "white" : "var(--foreground)",
                  lineHeight: 1.6,
                }}
              >
                {formatMessage(msg.content)}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--muted-foreground)",
                  marginTop: 4,
                  textAlign: msg.role === "user" ? "right" : "left",
                }}
              >
                {msg.timestamp}
              </div>
            </div>
            {msg.role === "user" && (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  flexShrink: 0,
                  background: "var(--secondary)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 2,
                }}
              >
                <User size={15} color="var(--muted-foreground)" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 12 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                flexShrink: 0,
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={15} color="white" />
            </div>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "4px 16px 16px 16px",
                background: "var(--card)",
                border: "1px solid var(--border)",
                display: "flex",
                gap: 4,
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--primary)",
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {messages.length < 3 && (
        <div style={{ padding: "0 32px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {suggestedQuestions.slice(0, 4).map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 500,
                background: "var(--card)",
                border: "1px solid var(--border)",
                cursor: "pointer",
                color: "var(--muted-foreground)",
                textAlign: "left",
                lineHeight: 1.4,
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div
        style={{
          padding: "16px 32px 24px",
          borderTop: "1px solid var(--border)",
          background: "var(--card)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-end",
            background: "var(--secondary)",
            borderRadius: 12,
            border: "1px solid var(--border)",
            padding: "10px 14px",
          }}
        >
          <Brain size={16} color="#8B5CF6" style={{ flexShrink: 0, marginBottom: 2 }} />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask anything about your finances..."
            rows={1}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              fontSize: 14,
              color: "var(--foreground)",
              resize: "none",
              fontFamily: "var(--font-body)",
              lineHeight: 1.5,
              maxHeight: 120,
              overflowY: "auto",
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              flexShrink: 0,
              background: input.trim() && !loading ? "var(--primary)" : "var(--border)",
              border: "none",
              cursor: input.trim() && !loading ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s",
            }}
          >
            <Send size={14} color={input.trim() && !loading ? "white" : "var(--muted-foreground)"} />
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: "var(--muted-foreground)" }}>
          FinSight AI analyzes your actual transaction data · Press Enter to send
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
