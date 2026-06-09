'use client';

import { useState, useEffect, useRef } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { getOrCreateSessionId } from '@/utils/sessionId';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date | string;
}

export default function Home() {
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = getOrCreateSessionId();
    setSessionId(id);
    fetchMessages(id).finally(() => setInitializing(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function fetchMessages(sid: string) {
    try {
      const res = await fetch(`/api/messages?sessionId=${sid}`);
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch {
      // silent fail — empty history is fine
    }
  }

  async function handleSend(message: string) {
    const userMsg: Message = { role: 'user', content: message, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Unknown error');
      }

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      const errMsg: Message = {
        role: 'assistant',
        content: `오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }

  if (initializing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm">로딩 중...</div>
      </main>
    );
  }

  return (
    <main className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2 shadow-sm">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <h1 className="text-base font-semibold text-gray-800">AI 챗봇</h1>
        <span className="text-xs text-gray-400 ml-auto">세션: {sessionId.slice(0, 20)}...</span>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <p className="text-lg mb-2">안녕하세요!</p>
              <p className="text-sm">궁금한 것을 물어보세요.</p>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} timestamp={msg.timestamp} />
          ))
        )}

        {loading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-2xl rounded-bl-sm text-sm">
              <span className="animate-pulse">답변 생성 중...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={loading} />
    </main>
  );
}
