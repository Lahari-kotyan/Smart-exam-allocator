import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageSquare, Send, Sparkles, Bot, User, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const suggestions = [
  "Who is free tomorrow?",
  "Show CSE faculty with least workload",
  "Which rooms still need invigilators?",
  "Show faculty with most duties",
];

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your AI invigilation assistant. I can help you with faculty availability, workload, exam scheduling, and room assignments. Ask me anything!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const data = await base44.entities.ChatHistory.list('-created_date', 20);
      // Reverse to chronological order
      const reversed = [...data].reverse();
      const formatted = reversed.map(h => ({ role: h.role, content: h.message }));
      if (formatted.length > 0) {
        setMessages([
          { role: 'assistant', content: "Hello! I'm your AI invigilation assistant. I can help you with faculty availability, workload, exam scheduling, and room assignments. Ask me anything!" },
          ...formatted
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (text) => {
    const question = text || input;
    if (!question.trim() || loading) return;

    const newMessages = [...messages, { role: 'user', content: question }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await base44.functions.invoke('chatbot', { question });
      const data = res.data || res;
      setMessages([...newMessages, { role: 'assistant', content: data.answer || data.error || 'Sorry, I could not process that request.' }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: `Error: ${err.response?.data?.error || err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white mb-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur">
          <Bot className="w-7 h-7" />
        </div>
        <div>
          <h2 className="font-bold text-lg">AI Invigilation Assistant</h2>
          <p className="text-indigo-100 text-sm">Powered by Gemini • Knows your faculty, exams & assignments</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-200 p-4 space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[75%] rounded-2xl p-3.5 ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-br-md'
                : 'bg-slate-100 text-slate-700 rounded-bl-md'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-100 rounded-2xl rounded-bl-md p-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
            <Lightbulb className="w-4 h-4" /> Try asking
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="text-sm bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600 px-3 py-1.5 rounded-lg transition"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          placeholder="Ask about faculty, exams, rooms..."
          className="flex-1"
          disabled={loading}
        />
        <Button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 px-4"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
