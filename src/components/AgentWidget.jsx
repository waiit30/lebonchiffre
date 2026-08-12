import React, { useState } from 'react';
import { Bot, X } from 'lucide-react';
import AgentChatPanel from '@/components/agent/AgentChatPanel';

export default function AgentWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg pulse-security hover:scale-105 transition-transform"
        aria-label="Assistant IA lebonchiffre"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[28rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Assistant lebonchiffre</p>
              <p className="text-[11px] opacity-80">Conseils · Suivi commande · 3x sans frais</p>
            </div>
          </div>
          <div className="flex-1 overflow-hidden p-4">
            <AgentChatPanel agentName="lebonchiffre_agent" title="Chat client lebonchiffre" />
          </div>
        </div>
      )}
    </>
  );
}