import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, HelpCircle, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: "Hello! I am your AI Investment Copilot. I have analyzed your portfolio allocation, risk profile, and watchlist. Ask me anything, or try one of the suggestions below.",
      timestamp: '12:00 PM',
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const presetChips = [
    'Explain NVDA catalysts',
    'Assess watchlist risk',
    'How to improve Sharpe ratio?',
  ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1500));

    let aiResponseText = '';
    const textLower = textToSend.toLowerCase();

    if (textLower.includes('nvda') || textLower.includes('catalyst')) {
      aiResponseText = `Based on my current analysis, **NVIDIA Corporation (NVDA)** has three major catalysts driving its **Strong Buy** rating:
1. **Blackwell Supercycle**: Customer demand is outstripping supply for the B200 nodes by 12+ months.
2. **Sovereign AI Deployment**: Countries are building sovereign clouds, adding non-hyperscaler revenue streams.
3. **High Margins**: Gross margins are projected to settle around **75.5%** in the mid-term due to strong pricing power.
      
*Potential Risk:* DoJ pricing probe could introduce regulatory noise, but fundamental growth remains intact.`;
    } else if (textLower.includes('sharpe') || textLower.includes('improve')) {
      aiResponseText = `To improve your portfolio's Sharpe ratio from the current simulated rating, consider these re-allocation strategies:
- **Increase Fixed Income (Bonds)**: Raising Bond allocation from 30% to 40% will damp overall portfolio standard deviation.
- **Moderate Digital Assets (Crypto)**: Reducing Crypto weight from 5% to 2% drastically lowers volatility (which is currently high at 65%).
- **Diversification Gain**: A balanced 60% Equity / 35% Fixed Income / 5% Alternatives ratio yields the optimal risk-adjusted return.`;
    } else if (textLower.includes('watchlist') || textLower.includes('risk')) {
      aiResponseText = `Analyzing your active watchlist:
- **TSLA** (Sentiment Index: 82%): Highest volatility but showing strong momentum. The AI sentiment is bullish due to FSD progress in China.
- **AAPL** (Sentiment Index: 78%): Balanced risk. Apple's upcoming device integration is positive for margins.
- **MSFT** (Sentiment Index: 54%): Volatility is low, but high capex on datacenter expansion is acting as a short-term dampener.`;
    } else {
      aiResponseText = `I've analyzed your query: "${textToSend}".
As an investment assistant, I recommend checking the **Factor Profile** and adjusting the **Portfolio Allocator** sliders to stress-test your weights. Let me know if you'd like a deep dive into macro indicators like interest rate adjustments or regulatory filings.`;
    }

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: aiResponseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  return (
    <div className="flex flex-col h-[480px] rounded-2xl border border-slate-200/80 bg-white/70 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/75 dark:shadow-black/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-white/50 px-6 py-4 dark:border-slate-800/80 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-extrabold text-slate-900 dark:text-white">AI Copilot Chat</h3>
        </div>
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Powered by Gemini 3.5</span>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
            >
              {isAI && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-450">
                  <Bot className="h-4.5 w-4.5" />
                </div>
              )}
              <div className="flex flex-col gap-1 max-w-[85%]">
                <div
                  className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    isAI
                      ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-tl-sm whitespace-pre-line'
                      : 'bg-blue-600 text-white rounded-tr-sm'
                  }`}
                >
                  {/* Format simple bolding in mock answers */}
                  {msg.text.split('\n').map((line, lineIdx) => {
                    // Simple replacement for bold markdown (**text**)
                    const parts = line.split('**');
                    return (
                      <p key={lineIdx} className={lineIdx > 0 ? 'mt-1.5' : ''}>
                        {parts.map((part, partIdx) => 
                          partIdx % 2 === 1 ? <strong key={partIdx} className="font-extrabold">{part}</strong> : part
                        )}
                      </p>
                    );
                  })}
                </div>
                <span className={`text-[9px] text-slate-400 ${!isAI ? 'text-right' : ''}`}>
                  {msg.timestamp}
                </span>
              </div>
              {!isAI && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-655 dark:bg-slate-800 dark:text-slate-300">
                  <User className="h-4.5 w-4.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Simulated Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-450">
              <Bot className="h-4.5 w-4.5" />
            </div>
            <div className="flex items-center gap-1 rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-800">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 dark:bg-slate-500" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 dark:bg-slate-500" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 dark:bg-slate-500" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Chip suggestions */}
      <div className="px-6 pb-2">
        <div className="flex flex-wrap gap-1.5">
          {presetChips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleSend(chip)}
              className="rounded-lg border border-slate-200/80 bg-white/40 px-2.5 py-1 text-[10px] font-bold text-slate-600 transition-all hover:bg-slate-105 dark:border-slate-800/80 dark:bg-slate-900/40 dark:text-slate-350 dark:hover:bg-slate-800"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form onSubmit={handleFormSubmit} className="border-t border-slate-200/80 p-4 dark:border-slate-800/80 bg-white/30 dark:bg-slate-900/30">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Copilot (e.g. Summarize earnings catalysts...)"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-12 text-xs text-slate-900 placeholder-slate-450 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
          <button
            type="submit"
            className="absolute right-2 top-1.5 rounded-lg bg-blue-600 p-1.5 text-white transition-all hover:bg-blue-700 active:scale-95 disabled:bg-slate-200 dark:disabled:bg-slate-800 dark:disabled:text-slate-600"
            disabled={!input.trim()}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
