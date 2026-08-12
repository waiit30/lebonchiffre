import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, ArrowLeft, ShieldCheck } from 'lucide-react';
import AgentChatPanel from '@/components/agent/AgentChatPanel';

export default function AgentBackoffice() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-16">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-cyan-400">
        <ArrowLeft className="h-4 w-4" /> Retour au site
      </Link>

      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-400/30">
          <Bot className="h-6 w-6 text-cyan-400" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">Espace de gestion IA</h1>
          <p className="text-sm text-muted-foreground">Analysez vos ventes, gérez les commandes et relancez les suivis par e-mail.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-500/5 px-4 py-3 text-xs text-cyan-400">
        <ShieldCheck className="h-4 w-4" /> Espace back-office — votre assistant IA gère le site en votre nom.
      </div>

      <div className="mt-6 h-[36rem] rounded-2xl border border-border bg-card p-4 md:p-6">
        <AgentChatPanel agentName="lebonchiffre_agent" title="Back-office lebonchiffre" />
      </div>
    </div>
  );
}