'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ChatMessage = {
  id: number;
  username: string;
  text: string;
  timestamp: number;
  isSelf: boolean;
};

const SAMPLE_MESSAGES: ChatMessage[] = [
  { id: 0, username: 'CarlosV', text: 'Trueno va a ganar esta sin duda', timestamp: Date.now() - 45000, isSelf: false },
  { id: 1, username: 'MariaR', text: 'Tornado tiene mejores cuotas, yo voy por ese', timestamp: Date.now() - 30000, isSelf: false },
  { id: 2, username: 'JugadorPro', text: 'Suerte para todos!', timestamp: Date.now() - 15000, isSelf: false },
];

let messageIdCounter = 3;

export function LiveChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(SAMPLE_MESSAGES);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      {
        id: messageIdCounter++,
        username: 'Tú',
        text,
        timestamp: Date.now(),
        isSelf: true,
      },
    ]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <>
      {/* Chat Panel */}
      <div
        className={cn(
          'fixed bottom-0 right-0 z-40 flex flex-col transition-all duration-300 sm:right-4 sm:bottom-4',
          'h-[320px] w-full max-w-sm sm:h-[400px] sm:rounded-2xl sm:border sm:border-border/60',
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0 sm:translate-y-4'
        )}
      >
        <div className="flex items-center justify-between rounded-t-2xl border-b border-border/60 bg-card/90 px-4 py-2.5 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-foreground">Chat en Vivo</p>
              <p className="text-[10px] text-muted-foreground">Comunidad</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar chat"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 space-y-2 overflow-y-auto bg-background/95 px-3 py-3 scrollbar-hide"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn('flex flex-col', msg.isSelf ? 'items-end' : 'items-start')}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-xl px-3 py-1.5',
                  msg.isSelf
                    ? 'bg-primary/15 border border-primary/20'
                    : 'bg-secondary/60'
                )}
              >
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={cn(
                      'text-[10px] font-bold',
                      msg.isSelf ? 'text-primary' : 'text-accent'
                    )}
                  >
                    {msg.username}
                  </span>
                  <span className="text-[9px] text-muted-foreground tabular-nums">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-foreground break-words">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-border/60 bg-card/90 px-3 py-2.5 backdrop-blur-xl">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            maxLength={200}
            className="flex-1 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:hover:bg-primary"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Toggle Button */}
      {!open && (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 300);
          }}
          className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 active:scale-95 glow-green"
          aria-label="Abrir chat"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-accent border-2 border-background" />
        </button>
      )}
    </>
  );
}
