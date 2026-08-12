import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';

export default function AgentChatPanel({ agentName, title = "Assistant IA" }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const conv = await base44.agents.createConversation({ agent_name: agentName, metadata: { name: title } });
        if (!alive) return;
        setConversation(conv);
        setMessages(conv.messages || []);
      } catch (e) {
        console.error('createConversation error', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [agentName]);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return () => unsubscribe();
  }, [conversation?.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !conversation || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);
    try {
      await base44.agents.addMessage(conversation, { role: 'user', content });
    } catch (e) {
      console.error('addMessage error', e);
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Initialisation de l'assistant…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-8">
            Posez votre question : conseils produits, suivi de commande, paiement 3x sans frais…
          </div>
        )}
        {messages.map((m, i) => {
          const isUser = m.role === 'user';
          return (
            <div key={i} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isUser ? 'bg-primary text-primary-foreground' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-400/30'}`}>
                {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isUser ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}>
                {m.content ? (
                  isUser ? <p>{m.content}</p> : <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                ) : (
                  <span className="text-muted-foreground italic">…</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Écrivez votre message…"
          className="flex-1 bg-background border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-cyan-400/50"
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}