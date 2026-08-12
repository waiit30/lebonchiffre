import React from 'react';
import { Shield, Lock, BadgeCheck, Zap } from 'lucide-react';

export default function SecurityBadges({ compact = false }) {
  const badges = [
    { icon: Lock, label: "Paiement chiffré SSL 256-bit" },
    { icon: Shield, label: "Garantie remboursement 30 j" },
    { icon: BadgeCheck, label: "Certifié PCI-DSS Level 1" },
    { icon: Zap, label: "Livraison express suivie" }
  ];
  return (
    <div className={compact ? "flex flex-wrap gap-4" : "grid grid-cols-2 gap-4 md:grid-cols-4"}>
      {badges.map((b, i) => (
        <div key={i} className="flex items-center gap-2 text-sm text-cyan-100/80">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-cyan-400/30 bg-cyan-500/10">
            <b.icon className="h-4 w-4 text-cyan-400" />
          </div>
          {!compact && <span className="leading-tight">{b.label}</span>}
        </div>
      ))}
    </div>
  );
}