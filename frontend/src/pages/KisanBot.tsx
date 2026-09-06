import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bot,
  CircleHelp,
  ExternalLink,
  Send,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

type Source = {
  title: string;
  url: string;
};

type Message = {
  role: "user" | "bot";
  message: string;
  sources?: Source[];
};

function KisanBot() {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      message:
        "Hello! I'm KisanMitra Bot. Ask me anything about farming, crops, agricultural markets, prices, or KisanMitra.",
    },
  ]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".bot-header", {
        y: -25,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });

      gsap.from(".bot-container", {
        y: 35,
        opacity: 0,
        duration: 0.8,
        delay: 0.15,
        ease: "power3.out",
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!particlesRef.current) return;

    const particles =
      particlesRef.current.querySelectorAll(".bot-particle");

    particles.forEach((particle) => {
      gsap.set(particle, {
        left: gsap.utils.random(1, 99) + "%",
        top: window.innerHeight + gsap.utils.random(0, 300),
        scale: gsap.utils.random(0.8, 1.8),
        opacity: gsap.utils.random(0.35, 0.8),
      });

      gsap.to(particle, {
        y: gsap.utils.random(
          -window.innerHeight - 200,
          -window.innerHeight
        ),
        x: gsap.utils.random(-120, 120),
        opacity: 0,
        duration: gsap.utils.random(7, 13),
        repeat: -1,
        delay: gsap.utils.random(0, 8),
        ease: "none",
      });
    });

    return () => {
      gsap.killTweensOf(particles);
    };
  }, []);

  useEffect(() => {
    if (!messagesRef.current) return;

    messagesRef.current.scrollTop =
      messagesRef.current.scrollHeight;
  }, [messages, sending]);

  async function sendMessage() {
    const text = message.trim();

    if (!text || sending) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        message: text,
      },
    ]);

    setMessage("");
    setSending(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/kisan-bot/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to get response"
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          message:
            data.reply || "I couldn't generate a response.",
          sources: Array.isArray(data.sources)
            ? data.sources
            : [],
        },
      ]);
    } catch (error) {
      console.error("KISAN BOT ERROR:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          message:
            "I'm currently unable to connect to the KisanMitra AI service. Please try again shortly.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <div
      ref={pageRef}
      className="relative min-h-screen overflow-hidden bg-[#050705] text-white"
    >
      {/* PARTICLES */}

      <div
        ref={particlesRef}
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {Array.from({ length: 70 }).map((_, index) => (
          <span
            key={index}
            className="bot-particle absolute h-[6px] w-[6px] rounded-full bg-[#39ff14]"
            style={{
              boxShadow:
                "0 0 7px #39ff14, 0 0 16px #39ff14, 0 0 28px rgba(57,255,20,.55)",
            }}
          />
        ))}
      </div>

      <main className="relative z-10 mx-auto min-h-screen max-w-[1200px] px-5 py-8 sm:px-8 lg:px-10">
        {/* HEADER */}

        <div className="bot-header mb-7">
          <button
            onClick={() => navigate("/buyer-dashboard")}
            className="mb-6 flex items-center gap-2 rounded-xl border border-[#3f6f3f] bg-[#132013] px-4 py-2.5 text-sm font-medium text-[#8fbd8f] transition-all duration-200 hover:bg-[#1b2d1b] hover:text-[#b4d8b4]"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#7f9f5c]/20 bg-[#101510] text-[#91ad68]">
              <Bot size={23} />
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.22em] text-[#39ff14]/60">
                Help & Support
              </p>

              <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
                KisanMitra Bot
              </h1>

              <p className="mt-1 text-sm text-white/35">
                Your agricultural and KisanMitra assistant
              </p>
            </div>
          </div>
        </div>

        {/* CHAT */}

        <section className="bot-container overflow-hidden rounded-2xl border border-white/[0.08] bg-[#090c09] shadow-[8px_8px_25px_rgba(0,0,0,.45)]">
          {/* CHAT HEADER */}

          <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0c100c] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#101510] text-[#91ad68]">
                <Bot size={19} />

                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#39ff14] shadow-[0_0_8px_#39ff14]" />
              </div>

              <div>
                <p className="text-sm font-semibold text-white/80">
                  KisanMitra Assistant
                </p>

                <p className="text-[10px] text-[#39ff14]/60">
                  Online · Google Search
                </p>
              </div>
            </div>

            <CircleHelp
              size={18}
              className="text-white/20"
            />
          </div>

          {/* MESSAGES */}

          <div
            ref={messagesRef}
            className="h-[55vh] min-h-[420px] space-y-5 overflow-y-auto p-5 sm:p-7"
          >
            {messages.map((item, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  item.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {item.role === "bot" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#101510] text-[#91ad68]">
                    <Bot size={17} />
                  </div>
                )}

                <div
                  className={`max-w-[78%] ${
                    item.role === "bot"
                      ? "space-y-3"
                      : ""
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                      item.role === "user"
                        ? "rounded-br-md bg-[#7f9f5c] text-[#081007]"
                        : "rounded-bl-md border border-white/[0.06] bg-[#101410] text-white/65"
                    }`}
                  >
                    {item.message}
                  </div>

                  {item.role === "bot" &&
                    item.sources &&
                    item.sources.length > 0 && (
                      <div className="rounded-xl border border-white/[0.06] bg-[#0c100c] p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#39ff14] shadow-[0_0_7px_#39ff14]" />
                          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">
                            Sources
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          {item.sources.map(
                            (source, sourceIndex) => (
                              <a
                                key={`${source.url}-${sourceIndex}`}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-white/40 transition hover:bg-white/[0.03] hover:text-[#91ad68]"
                              >
                                <ExternalLink
                                  size={12}
                                  className="shrink-0"
                                />

                                <span className="truncate">
                                  {source.title ||
                                    source.url}
                                </span>
                              </a>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>

                {item.role === "user" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#132013] text-[#91ad68]">
                    <UserRound size={17} />
                  </div>
                )}
              </div>
            ))}

            {sending && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#101510] text-[#91ad68]">
                  <Bot size={17} />
                </div>

                <div className="rounded-2xl rounded-bl-md border border-white/[0.06] bg-[#101410] px-5 py-3">
                  <div className="flex gap-1.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#91ad68]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#91ad68] [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#91ad68] [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* INPUT */}

          <div className="border-t border-white/[0.06] bg-[#080b08] p-4 sm:p-5">
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#0c100c] p-2">
              <input
                type="text"
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask KisanMitra anything..."
                disabled={sending}
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-white/75 outline-none placeholder:text-white/25 disabled:opacity-50"
              />

              <button
                onClick={sendMessage}
                disabled={!message.trim() || sending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#7f9f5c] text-[#081007] transition hover:bg-[#91ad68] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Send size={17} />
              </button>
            </div>

            <p className="mt-3 text-center text-[10px] text-white/20">
              Responses may use Google Search for current
              agricultural information.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default KisanBot;