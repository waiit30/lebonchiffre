import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, DollarSign } from 'lucide-react';

export default function Footer() {
  const [protectedCount, setProtectedCount] = useState(847291);

  useEffect(() => {
    const t = setInterval(() => setProtectedCount(c => c + Math.floor(Math.random() * 3) + 1), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <footer className="relative border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center border border-cyan-400/40 bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-cyan-400" />
              </div>
              <span className="font-display text-lg font-bold text-foreground">
                lebon<span className="text-cyan-400">chiffre</span><DollarSign className="inline h-4 w-4 -ml-0.5 text-yellow-400" strokeWidth={3} />
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              La vitrine des produits les plus vendus, protégée par une infrastructure de paiement de niveau bancaire.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-xs uppercase tracking-widest text-cyan-400">Transactions protégées</h4>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold text-foreground tabular-nums">{protectedCount.toLocaleString('fr-FR')}</span>
              <span className="text-sm text-muted-foreground">paiements sécurisés</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Chiffrement AES-256 · Surveillance 24/7 · Conformité PCI-DSS</p>
          </div>

          <div>
            <h4 className="font-heading text-xs uppercase tracking-widest text-cyan-400">Alerte best-sellers</h4>
            <form onSubmit={(e) => e.preventDefault()} className="mt-4 flex">
              <input
                type="email"
                placeholder="votre@email.com"
                className="flex-1 border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-cyan-400 focus:outline-none"
              />
              <button className="flex items-center gap-1 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground/60">Vos données restent chiffrées et ne sont jamais revendues.</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground/60">© 2026 lebonchiffre. Tous droits réservés.</p>
          <div className="flex gap-6 text-xs text-muted-foreground/60">
            <span className="cursor-default">Mentions légales</span>
            <span className="cursor-default">Confidentialité</span>
            <span className="cursor-default">CGV</span>
          </div>
        </div>
      </div>
    </footer>
  );
}