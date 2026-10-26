import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, Check } from 'lucide-react';

interface CustomerAiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySuggestion?: (type: string, value: any) => void;
}

export const CustomerAiAssistant: React.FC<CustomerAiAssistantProps> = ({
  isOpen,
  onClose,
  onApplySuggestion
}) => {
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: "Hello! I am your KITNOVA AI Sportswear Stylist. I can recommend font pairings, team colorways, chest sponsors, and official Ugandan league regulations. How can I assist your kit design today?"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputText.trim()) return;
    const userMsg = inputText.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = "That looks fantastic! For a striking contrast against royal navy fabric, I recommend our brushed gold vinyl with 'Bebas Pro' typography. It ensures maximum pitch visibility under floodlights.";
      const lower = userMsg.toLowerCase();
      if (lower.includes('font') || lower.includes('typography')) {
        reply = "For high-performance sportswear, 'Bebas Pro' and 'Oswald Athletic' offer the cleanest legibility for squad numbers from 50 meters away. For modern futuristic teams, 'Orbitron Cyber' is a trending favorite!";
      } else if (lower.includes('sponsor') || lower.includes('text')) {
        reply = "Recommended chest sponsors for Ugandan clubs include 'KAMPALA STARS', 'PEARL ENERGY', or your custom corporate brand. Placing it at 52% canvas height gives the ideal athletic proportions.";
      } else if (lower.includes('color') || lower.includes('away')) {
        reply = "Our classic winning combination is Dark Navy (#0A1A3C) base with Brushed Gold (#D4A029) trims and Pure White name printing. Alternatively, the Uganda Tribute matte black and crimson kit has a bold presence!";
      }

      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0A1A3C] border border-slate-700 rounded-2xl max-w-lg w-full h-[520px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-[#0F2A5F]/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D4A029] text-[#0A1A3C] flex items-center justify-center font-bold shadow">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">KITNOVA AI Design Assistant</h3>
              <p className="text-[10px] text-slate-400">Sportswear styling & regulations consultant</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#D4A029] text-[#0A1A3C] font-semibold rounded-tr-none'
                    : 'bg-[#0F2A5F]/70 text-slate-200 border border-slate-700/80 rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <Bot className="w-4 h-4 animate-spin text-[#D4A029]" />
              <span>Analyzing jersey palette...</span>
            </div>
          )}
        </div>

        {/* Suggestions chips */}
        <div className="px-4 py-2 bg-[#0F2A5F]/20 border-t border-slate-800 flex gap-2 overflow-x-auto text-[11px]">
          {['Best font for #10?', 'Suggest colorway', 'Uganda tribute ideas'].map(s => (
            <button
              key={s}
              onClick={() => setInputText(s)}
              className="px-2.5 py-1 rounded-md bg-[#0F2A5F]/60 border border-slate-700 text-slate-300 hover:text-white whitespace-nowrap"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 bg-[#0A1A3C] border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask about fonts, colors, badge rules..."
            className="flex-1 px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#D4A029]"
          />
          <button
            onClick={handleSend}
            className="p-2.5 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-bold hover:bg-[#F0C760] transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
