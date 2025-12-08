import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { askGemini } from "../lib/geminiApi";

export default function ProductChatbot({ product }) {
  const location = useLocation();
  const hasProduct = !!product && Object.keys(product || {}).length > 0;
  const isProductPage = location.pathname.startsWith("/product/");

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Quick reply suggestions
  const quickReplies = [
    "What products do you sell?",
    "How long is delivery?",
    "What is your return policy?",
    "What payment methods do you accept?",
  ];

  // Gemini-powered answer generator with product context
  const generateAnswer = async (question) => {
    try {
      // Build context for Gemini
      let context = `You are a helpful shopping assistant for an Ayurvedic e-commerce store called Sewa. `;
      context += `Store info: We offer Ayurvedic products, standard delivery is 3-5 days, free shipping on orders ₹999+, `;
      context += `7-day returns policy, we accept UPI/cards/COD, use coupon AYU20 for 20% off on orders ₹799+. `;
      
      if (hasProduct && product) {
        context += `Currently viewing product: "${product.name}" by ${product.brand}, `;
        context += `priced at ₹${product.price}`;
        if (product.discount) context += ` with ${product.discount}% discount`;
        if (product.description) context += `. Description: ${product.description.slice(0, 200)}`;
        context += `. `;
      }
      
      context += `Question: ${question}`;

      // Ask Gemini with context
      const geminiAnswer = await askGemini(context);
      
      if (geminiAnswer && geminiAnswer.length > 10) {
        return geminiAnswer;
      }
    } catch (err) {
      console.error("Gemini error:", err);
    }

    // Fallback if Gemini fails
    const highlights = Array.isArray(product?.highlights)
      ? product.highlights.filter(Boolean)
      : [];
    
    if (hasProduct) {
      if (highlights.length) {
        return `✨ Here are key highlights: ${highlights.slice(0, 3).join(" · ")}`;
      }
      if (product.description) {
        return `📋 ${product.description.slice(0, 240)}`;
      }
    }
    
    return "👋 I'm here to help! Ask me anything about products, pricing, delivery, returns, payment, coupons, or our store!";
  };

  const intro = useMemo(() => {
    if (hasProduct) {
      return `Hi! Ask me about ${product?.name}—price, variants, delivery, or anything else!`;
    }
    return "Hi! 👋 Ask me about products, pricing, delivery, returns, coupons, or anything about our store!";
  }, [hasProduct, product]);

  useEffect(() => {
    setMessages([{ from: "bot", text: intro, suggestions: quickReplies }]);
  }, [intro]);

  // Auto-scroll to latest message
  useEffect(() => {
    const chatContainer = document.getElementById("chat-messages");
    if (chatContainer) {
      setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 100);
    }
  }, [messages]);

  // Avoid double render when a product-specific chatbot is mounted on product pages
  if (!hasProduct && isProductPage) return null;

  const handleSend = async (text = input) => {
    if (!text.trim() || loading) return;
    const userMsg = { from: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const answer = await generateAnswer(text.trim());
      const botMsg = { from: "bot", text: answer };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const botMsg = { from: "bot", text: "Sorry, I couldn't process that. Try again!" };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = (suggestion) => {
    handleSend(suggestion);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open && (
        <div className="card-surface border border-slate-800/70 shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-96 max-w-[95vw] rounded-3xl p-0 mb-3 flex flex-col max-h-[600px]">
          {/* Header */}
          <div className="border-b border-slate-800/50 px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300 font-semibold">Sewa Assistant</p>
              <p className="text-sm font-bold text-slate-50">Your Product Expert</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-emerald-300 text-xl transition"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages Container with auto-scroll */}
          <div
            id="chat-messages"
            className="flex-1 overflow-y-auto space-y-3 px-5 py-4 scroll-smooth"
          >
            {messages.map((msg, idx) => (
              <div key={idx}>
                <div
                  className={`flex ${
                    msg.from === "user" ? "justify-end" : "justify-start"
                  } mb-2`}
                >
                  <div
                    className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.from === "bot"
                        ? "bg-slate-900/90 border border-slate-800 text-slate-100"
                        : "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-medium"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>

                {/* Quick Reply Buttons */}
                {msg.from === "bot" && msg.suggestions && (
                  <div className="flex flex-wrap gap-2 mb-3 justify-start">
                    {msg.suggestions.map((suggestion, sidx) => (
                      <button
                        key={sidx}
                        onClick={() => handleQuickReply(suggestion)}
                        disabled={loading}
                        className="text-xs px-3 py-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 transition disabled:opacity-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-800/50 px-5 py-4 bg-slate-950/50">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading && input.trim()) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your question..."
                disabled={loading}
                className="flex-1 rounded-full bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none disabled:opacity-50 transition"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold p-2.5 shadow-[0_8px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_12px_30px_rgba(16,185,129,0.45)] transition disabled:opacity-50"
                aria-label="Send message"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-semibold px-5 py-3.5 shadow-[0_18px_40px_rgba(16,185,129,0.35)] hover:translate-y-[1px] transition text-sm"
        aria-label="Open product chatbot"
      >
        {open ? "Close" : "💬 Ask AI"}
      </button>
    </div>
  );
}

