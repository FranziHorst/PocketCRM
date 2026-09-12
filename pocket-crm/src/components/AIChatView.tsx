import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { UserProfile, Contact, DailyTask, ChatMessage } from "../types";

interface AIChatViewProps {
  userProfile: UserProfile;
  contacts: Contact[];
  tasks: DailyTask[];
  prefilledPrompt?: string;
  onClearPrefilledPrompt?: () => void;
}

export const AIChatView: React.FC<AIChatViewProps> = ({
  userProfile,
  contacts,
  tasks,
  prefilledPrompt,
  onClearPrefilledPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m_welcome",
      sender: "assistant",
      text: `Hey ${
        userProfile.name.split(" ")[0]
      }! I'm your Pocket Copilot. I know your ${
        contacts.length
      } contacts, your daily tasks, and who's due for a follow-up. You can type or use your voice to ask me to draft messages, review contacts, or prep for meetings!`,
      timestamp: "Just now",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Speech Recognition (Speech-to-Text) state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Speech Synthesis (Text-to-Speech) state
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Handle prefilled prompt from other views
  useEffect(() => {
    if (prefilledPrompt) {
      setInputText(prefilledPrompt);
      if (onClearPrefilledPrompt) onClearPrefilledPrompt();
    }
  }, [prefilledPrompt, onClearPrefilledPrompt]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Speech recognition start error:", err);
      }
    }
  };

  // Speak text using Web Speech Synthesis
  const speakText = (text: string, messageId: string) => {
    if (!("speechSynthesis" in window)) {
      alert("Speech synthesis is not supported on your browser.");
      return;
    }

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setSpeakingMessageId(messageId);
    };

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      // Build CRM context summary
      const crmSummary = `Contacts: ${contacts
        .map(
          (c) =>
            `${c.name} (${c.role} at ${c.company}, Tags: ${c.tags.join(
              ", "
            )}, Next Reminder: ${c.nextReminderDate}, Notes: "${c.notes}")`
        )
        .join("; ")}. Daily Tasks: ${tasks
        .map((t) => `${t.title} (${t.completed ? "Done" : "Pending"})`)
        .join(", ")}`;

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages,
          userProfile,
          crmSummary,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: `ast_${Date.now()}`,
        sender: "assistant",
        text: data.reply,
        timestamp: "Just now",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // If autoSpeak is enabled, read response out loud
      if (autoSpeak) {
        speakText(data.reply, assistantMessage.id);
      }
    } catch (err: any) {
      console.error("AI Chat error:", err);
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: "assistant",
        text: "Sorry, I couldn't reach the server. Make sure your Gemini API key is configured in Settings > Secrets.",
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const samplePrompts = [
    "Draft a coffee follow-up for Maya Lin",
    "Who in my network is overdue for a check-in?",
    "Prep 3 smart questions for an angel investor",
    "Suggest icebreakers for a tech founder mixer",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[700px] bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
      {/* Chat Sub-Header with Voice Controls */}
      <div className="bg-white px-4 py-2.5 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              Pocket AI Copilot
            </h3>
            <p className="text-[10px] text-emerald-600 font-medium flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Voice & CRM Enabled</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {/* Auto-speech toggle */}
          <button
            type="button"
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium flex items-center space-x-1 transition-colors ${
              autoSpeak
                ? "bg-violet-100 text-violet-700"
                : "text-slate-500 hover:bg-slate-100"
            }`}
            title={autoSpeak ? "Auto-speak is ON" : "Auto-speak is OFF"}
          >
            {autoSpeak ? (
              <Volume2 className="w-3.5 h-3.5 text-violet-600" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="hidden sm:inline">
              {autoSpeak ? "Voice Auto-read" : "Voice Off"}
            </span>
          </button>

          {/* Reset chat button */}
          <button
            type="button"
            onClick={() =>
              setMessages([
                {
                  id: "m_welcome",
                  sender: "assistant",
                  text: `Chat reset! How can I help you strengthen your relationships today?`,
                  timestamp: "Just now",
                },
              ])
            }
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Reset Chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-violet-600 text-white"
              }`}
            >
              {msg.sender === "user" ? (
                <User className="w-3.5 h-3.5" />
              ) : (
                <Bot className="w-3.5 h-3.5" />
              )}
            </div>

            <div
              className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed space-y-1 ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white rounded-tr-xs"
                  : "bg-white text-slate-800 border border-slate-200/80 shadow-2xs rounded-tl-xs"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Message Footer: Voice & Copy Tools for Assistant replies */}
              {msg.sender === "assistant" && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => speakText(msg.text, msg.id)}
                      className={`flex items-center space-x-1 hover:text-violet-600 transition-colors ${
                        speakingMessageId === msg.id
                          ? "text-violet-600 font-bold"
                          : ""
                      }`}
                      title="Listen with Speech Synthesis"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>
                        {speakingMessageId === msg.id ? "Playing..." : "Listen"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(msg.text, msg.id)}
                      className="hover:text-slate-600 transition-colors flex items-center space-x-1"
                      title="Copy text"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">
                            Copied
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs pl-9">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-600" />
            <span>AI Copilot is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-2 bg-white/70 border-t border-slate-100 overflow-x-auto flex items-center space-x-1.5 scrollbar-none">
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="flex-shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-violet-50 hover:text-violet-700 text-slate-600 text-[11px] font-medium transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Area with Voice Recording */}
      <div className="p-3 bg-white border-t border-slate-200">
        {isListening && (
          <div className="mb-2 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-700 animate-pulse">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              <span className="font-semibold">
                Listening to your voice... Speak now
              </span>
            </div>
            <button
              onClick={toggleListening}
              className="font-bold underline text-rose-800"
            >
              Stop
            </button>
          </div>
        )}

        <div className="flex items-center space-x-2">
          {/* Speech-to-Text Microphone Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 rounded-xl transition-all ${
              isListening
                ? "bg-rose-600 text-white shadow-md shadow-rose-300 ring-2 ring-rose-400 animate-bounce"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
            title={
              speechSupported
                ? isListening
                  ? "Stop Listening"
                  : "Tap to Speak (Voice Input)"
                : "Voice not supported in this browser"
            }
          >
            {isListening ? (
              <MicOff className="w-4 h-4 text-white" />
            ) : (
              <Mic className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              isListening
                ? "Listening... speak clearly"
                : "Ask about your network, draft follow-ups..."
            }
            className="flex-1 px-3.5 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white shadow-xs shadow-indigo-200 transition-all"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
