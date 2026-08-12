import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Search, Wallet, Lock, CreditCard, Activity, ArrowRight, CheckCircle2, RefreshCw, TrendingDown } from 'lucide-react';
import SecurityBadges from '@/components/SecurityBadges';
import { base44 } from '@/api/base44Client';

export default function Explication() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleRefresh = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await base44.functions.invoke('refreshLowestPrices', {});
      setResult(res.data);
    } catch (e) {
      setError(e.message || "Erreur lors de la mise à jour des prix.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      icon: Search,
      title: "1 · Recherche du prix le plus bas",
      desc: "Pour chaque best-seller, nous scannons en continu les principaux sites partenaires (Amazon, Cdiscount, Fnac, Darty, Boulanger, Rue du Commerce…) afin d'identifier le prix public le plus bas constaté."
    },
    {
      icon: TrendingDown,
      title: "2 · Marge de 6 % seulement",
      desc: "Nous ajoutons 6 % au prix le plus bas trouvé chez nos partenaires. C'est notre seule marge, sans aucun frais caché ni intermédiaire supplémentaire."
    },
    {
      icon: Wallet,
      title: "3 · Pourquoi 6 % ?",
      desc: "Cette marge finance le traitement sécurisé du paiement (Stripe/PayPal), l'expédition directe par notre fournisseur partenaire et la maintenance du site. Vous profitez du prix le plus bas, nous gérons toute la logistique."
    },
    {
      icon: ShieldCheck,
      title: "4 · Paiement sécurisé",
      desc: "Le règlement s'effectue via Stripe (chiffrement 256-bit), avec Apple Pay, Google Pay et le paiement en 3x sans frais disponibles sur tous les achats."
    }
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-20">
      {/* En-tête */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400">
          <Activity className="h-3 w-3 pulse-security" /> Comment fonctionne lebonchiffre
        </span>
        <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
          Le prix le plus bas, <span className="text-cyan-400">transparent</span> et garanti
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground">
          lebonchiffre recense les best-sellers High-Tech, Maison et Mode, et vous les propose au prix le plus bas du marché.
          Notre seule rémunération est une <span className="font-semibold text-cyan-400">marge de 6 % par produit</span> — l'expédition est gérée automatiquement par notre fournisseur partenaire.
        </p>
      </div>

      {/* Bloc de transparence — les 0,05 € */}
      <div className="mt-12 border border-cyan-400/30 bg-cyan-500/5 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center border border-cyan-400/40 bg-cyan-500/10 pulse-security">
          <Wallet className="h-7 w-7 text-cyan-400" />
        </div>
        <h2 className="mt-5 font-display text-2xl font-bold text-foreground">Notre seul revenu : 6 % de marge par produit</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
          Nous comparons les prix sur l'ensemble des sites partenaires, puis ajoutons une marge de 6 % au prix le plus bas trouvé.
          Cette contribution couvre le traitement du paiement, l'expédition directe par le fournisseur et la maintenance du site.
          Aucune autre commission n'est prélevée : vous payez ainsi le prix le plus bas pour chaque produit proposé.
        </p>
        <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-4 text-sm">
          <div className="flex-1 border border-border bg-background/50 p-4">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Prix partenaire le plus bas</span>
            <p className="mt-1 font-display text-xl font-bold text-foreground">— X,XX €</p>
          </div>
          <span className="font-display text-2xl font-bold text-cyan-400">×</span>
          <div className="flex-1 border border-cyan-400/40 bg-cyan-500/10 p-4">
            <span className="text-xs uppercase tracking-widest text-cyan-400">Notre marge</span>
            <p className="mt-1 font-display text-xl font-bold text-cyan-400">+6 %</p>
          </div>
          <span className="font-display text-2xl font-bold text-cyan-400">=</span>
          <div className="flex-1 border border-border bg-background/50 p-4">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Votre prix</span>
            <p className="mt-1 font-display text-xl font-bold text-foreground">Le plus bas</p>
          </div>
        </div>
      </div>

      {/* Étapes */}
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {steps.map((s, i) => (
          <div key={i} className="border border-border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center border border-cyan-400/30 bg-cyan-500/10">
              <s.icon className="h-6 w-6 text-cyan-400" />
            </div>
            <h3 className="mt-5 font-heading text-lg font-semibold text-foreground">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Engagement clarté */}
      <div className="mt-12 border border-border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground">Nos engagements clairs</h3>
        <ul className="mt-4 space-y-3">
          {[
            "Recherche du prix le plus bas sur l'ensemble des sites partenaires",
            "Marge unique et transparente de 6 % par produit, jamais plus",
            "Aucune commission cachée ni frais intermédiaire sur le produit",
            "Paiement sécurisé via Stripe — Apple Pay, Google Pay, 3x sans frais",
            "Garantie remboursement 30 jours et chiffrement SSL 256-bit",
          ].map((e, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
              {e}
            </li>
          ))}
        </ul>
      </div>

      {/* Mise à jour des prix */}
      <div className="mt-12 border border-cyan-400/30 bg-card p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center border border-cyan-400/40 bg-cyan-500/10">
          <RefreshCw className={`h-6 w-6 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
        </div>
        <h3 className="mt-5 font-heading text-lg font-semibold text-foreground">Mise à jour des prix en temps réel</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Lancez une actualisation : le système recherche à nouveau le prix le plus bas sur les sites partenaires et recalcule chaque tarif (prix trouvé + 6 %).
        </p>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="scan-border mt-5 inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground pulse-security disabled:opacity-60"
        >
          {loading ? <><Activity className="h-4 w-4 animate-pulse" /> Recherche en cours...</> : <><RefreshCw className="h-4 w-4" /> Actualiser les prix</>}
        </button>
        {error && <p className="mt-4 text-xs text-destructive">{error}</p>}
        {result && (
          <div className="mx-auto mt-5 max-w-md border border-cyan-400/30 bg-cyan-500/5 p-4 text-left text-sm">
            {result.updated > 0 ? (
              <>
                <p className="flex items-center gap-2 font-semibold text-cyan-400">
                  <CheckCircle2 className="h-4 w-4" /> {result.updated} produit(s) mis à jour sur {result.total}.
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {result.items?.slice(0, 6).map((it, i) => (
                    <li key={i}>{it.name} — trouvé {it.found.toFixed(2)}€ → prix {it.after.toFixed(2)}€</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-muted-foreground">
                La recherche de prix ne peut pas s'exécuter pour le moment (quota de recherche mensuel atteint).
                Le système est opérationnel et reprendra l'actualisation à la prochaine échéance.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Sécurité */}
      <div className="mt-12 border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold text-foreground">Paiement & sécurité</h3>
          <Lock className="h-5 w-5 text-cyan-400/50" />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><CreditCard className="h-3 w-3" /> Stripe</span>
          <span className="flex items-center gap-1"><Wallet className="h-3 w-3" /> Apple Pay · Google Pay</span>
          <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> SSL 256-bit</span>
          <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Remboursement 30 j</span>
        </div>
        <div className="mt-5">
          <SecurityBadges />
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 text-center">
        <Link to="/" className="inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground">
          Explorer les best-sellers <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}