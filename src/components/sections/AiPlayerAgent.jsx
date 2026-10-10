import React, { useState, useEffect, useRef } from "react";
import { useActiveSession } from "../../hooks/useActiveSession";
import { Bot, RefreshCw, Send, User } from "lucide-react";
import { SectionActionBar } from "../ui/SectionActionBar";

const SUGGESTIONS = [
  "My weak foot is terrible. Help.",
  "How do I get faster?",
  "What should I eat before a match?",
  "How to improve my first touch?",
  "How to stay confident under pressure?",
];

const INITIAL_WELCOME = {
  sender: "agent",
  text: "Ask me anything about the beautiful game - how to improve your technique, tactics, fitness, or mindset. I'm here to help you improve your knowledge your skill and your game.\n\nPlay like you always have the ball.",
};

export function AiPlayerAgent() {
  const { session } = useActiveSession();
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("aiAgentChat");
      return saved ? JSON.parse(saved) : [INITIAL_WELCOME];
    } catch (e) {
      return [INITIAL_WELCOME];
    }
  });

  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("aiAgentChat", JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const activeFoot = (session?.activeFooter || "RIGHT").toUpperCase();
  const isRightFoot = activeFoot === "RIGHT";
  const playerName = session?.playerName || "Player";

  const generateCoachResponse = (query) => {
    const q = query.toLowerCase();

    // 1. Injury safety check
    if (
      q.includes("hurt") ||
      q.includes("injur") ||
      q.includes("pain") ||
      q.includes("strain") ||
      q.includes("tear") ||
      q.includes("sprain") ||
      q.includes("concussion") ||
      q.includes("doctor")
    ) {
      return "Important: If you feel pain or believe you might be injured, stop training or playing immediately. Rest and ice the area, and always inform your parents, coach, or consult a medical doctor or athletic trainer before returning to the pitch.";
    }

    // 2. Inappropriate topics exclusion
    if (
      q.includes("drug") ||
      q.includes("alcohol") ||
      q.includes("smoke") ||
      q.includes("vape") ||
      q.includes("weapon") ||
      q.includes("sex") ||
      q.includes("dating") ||
      q.includes("gambl")
    ) {
      return "As your football mentor, I focus strictly on football techniques, pitch skills, and athletic training. Please speak with a parent, guardian, or trusted adult regarding this topic.";
    }

    // 3. Politics and religion exclusion
    if (
      q.includes("politic") ||
      q.includes("president") ||
      q.includes("election") ||
      q.includes("democrat") ||
      q.includes("republican") ||
      q.includes("religion") ||
      q.includes("god") ||
      q.includes("church") ||
      q.includes("faith")
    ) {
      return "I'm dedicated exclusively to football coaching, athletic training, and match preparation. I don't engage in political or religious discussions. Let's focus on improving your touch and ball mastery!";
    }

    // 4. Healthy food & nutrition for athletes
    if (
      q.includes("eat") ||
      q.includes("nutrition") ||
      q.includes("food") ||
      q.includes("diet") ||
      q.includes("snack") ||
      q.includes("breakfast") ||
      q.includes("meal") ||
      q.includes("water") ||
      q.includes("hydrat")
    ) {
      return "Clean nutrition powers elite performance! 3 to 4 hours before kickoff: Eat complex carbs and clean protein (like oatmeal with fruit & peanut butter, or brown rice with grilled chicken). 1 hour before match: Grab an easily digestible fruit like a banana. Stay thoroughly hydrated with water throughout the day, and avoid sugary sodas or heavy fried foods.";
    }

    // 5. Football fitness & speed
    if (
      q.includes("faster") ||
      q.includes("speed") ||
      q.includes("fitness") ||
      q.includes("stamina") ||
      q.includes("endurance") ||
      q.includes("conditioning")
    ) {
      return "Speed and fitness in football rely on explosive agility and high-intensity recovery! Practice 10-meter accelerations, boundary shuttle runs, and plyometric jump drills 2 to 3 times per week. Prioritize a thorough dynamic warm-up and get 8 to 10 hours of sleep for peak recovery.";
    }

    if (q.includes("weak foot")) {
      return `Hey ${playerName}! To fix your weak foot, start doing 100 1-touch passes against a wall every single day with ONLY your non-dominant foot. Focus on ankle locking, keeping your hips square, and hitting the center of the ball. Within 2 weeks of daily wall work, your confidence will explode!`;
    }

    if (q.includes("first touch") || q.includes("control")) {
      return "Great first touch requires cushioning the ball like a feather! As the ball approaches, pull your foot back slightly at the exact moment of impact. Practice receiving wall passes on both feet while turning smoothly into open space.";
    }

    if (q.includes("confidence") || q.includes("mindset") || q.includes("pressure")) {
      return "Mindset separates good players from elite players! Visualize your successful passes and movements before the game. When you make a mistake, drop it instantly and focus on winning the next ball. You've put in the training!";
    }

    return `Coach Clem Murdock here! Focus on mastering the basics: crisp 1-touch passing, relentless off-the-ball movement, and sharp decision making under pressure. What specific part of your game would you like to work on today?`;
  };

  const handleSend = (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg = { sender: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery("");
    setIsTyping(true);

    setTimeout(() => {
      const replyText = generateCoachResponse(query);
      setMessages((prev) => [...prev, { sender: "agent", text: replyText }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleResetChat = () => {
    if (confirm("Reset AI Player Agent chat?")) {
      setMessages([INITIAL_WELCOME]);
      localStorage.removeItem("aiAgentChat");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] sm:h-[calc(100vh-120px)] max-w-2xl mx-auto space-y-2 select-none overflow-hidden pb-2">
      {/* ── TOP HEADER BAR (Fixed Top) ── */}
      <div className="flex-shrink-0 p-3 rounded-2xl border border-white/10 bg-[#121015] flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          {/* Bot Avatar Icon */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FF4422] text-white flex items-center justify-center shadow-md flex-shrink-0">
            <Bot size={20} />
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-black text-white tracking-wide leading-none flex items-center gap-1.5">
              <span>AiPlayerAgent - Mentor</span>
            </h2>
            <p className="text-[10px] font-bold text-white/80 mt-1">
              Powered by Footballer Athletics
            </p>
          </div>
        </div>

        {/* New Chat Reset Button */}
        <button
          onClick={handleResetChat}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white text-[10px] font-bold uppercase transition-all border border-white/10"
        >
          <RefreshCw size={12} />
          <span>New Chat</span>
        </button>
      </div>

      {/* ── REQUIRED CLIENT SAFETY DISCLAIMER ── */}
      <div className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-center">
        <p className="text-[9.5px] font-semibold text-white/75 leading-tight">
          AI mentor for general football/soccer tips. Always follow your coaches, trainers, parents and medical professionals.
        </p>
      </div>

      {/* ── QUICK SUGGESTIONS SCROLL ROW (Fixed Top) ── */}
      <div className="flex-shrink-0 flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
        {SUGGESTIONS.map((text, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(text)}
            className="px-3 py-1.5 rounded-full bg-[#181418] border border-[#FF4422]/60 hover:bg-[#FF4422]/20 text-white text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 active:scale-95"
          >
            {text}
          </button>
        ))}
      </div>

      {/* ── CHAT MESSAGES CONTAINER (ONLY THIS SCROLLS!) ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 py-2 pr-1">
        {messages.map((msg, idx) => {
          const isAgent = msg.sender === "agent";

          if (isAgent && idx === 0) {
            // Welcome Banner Card
            return (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-2xl border-l-4 border-[#FF4422] bg-[#141217] space-y-2 shadow-xl"
              >
                <p className="text-xs sm:text-sm font-bold text-white leading-relaxed whitespace-pre-line">
                  {msg.text}
                </p>
              </div>
            );
          }

          return (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${
                isAgent ? "justify-start" : "justify-end"
              }`}
            >
              {isAgent && (
                <div className="w-7 h-7 rounded-full bg-[#FF4422] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={15} />
                </div>
              )}

              <div
                className={`max-w-[82%] p-3 sm:p-3.5 rounded-2xl text-xs sm:text-sm font-semibold leading-relaxed shadow-md ${
                  isAgent
                    ? "bg-[#16141C] border border-white/15 text-white rounded-tl-none"
                    : "bg-[#FF4422] text-white rounded-tr-none"
                }`}
              >
                {msg.text}
              </div>

              {!isAgent && (
                <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={15} />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-white/80 text-xs font-bold italic px-2 animate-pulse">
            <Bot size={14} />
            <span>AI Mentor is thinking...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── BOTTOM CHAT INPUT ROW (Fixed Bottom) ── */}
      <div className="flex-shrink-0 pt-1">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="How can I help you with your game?"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="w-full bg-[#16141D] border border-white/15 rounded-full py-2.5 px-4 text-xs sm:text-sm font-semibold text-white placeholder:text-white/70 focus:outline-none focus:border-white/40 transition-colors shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="w-10 h-10 rounded-full bg-[#FF4422] hover:bg-[#FF6B35] text-white flex items-center justify-center shadow-lg disabled:opacity-40 transition-all flex-shrink-0 active:scale-95"
          >
            <Send size={15} />
          </button>
        </form>
      </div>

      {/* Action Bar */}
      <div className="flex-shrink-0">
        <SectionActionBar sectionKey="ai-agent" onReset={handleResetChat} />
      </div>
    </div>
  );
}
