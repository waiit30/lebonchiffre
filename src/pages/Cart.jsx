import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Trash2, ArrowLeft, Activity, Mail, CreditCard, Wallet } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useCart } from '@/lib/cartStore';

export default function Cart() {
  const { items, dispatch, total } = useCart();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState('full');
  const installment = total > 0 ? total / 3 : 0;

  const handleCheckout = async () => {
    setError('');
    if (items.length === 0) return;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Veuillez saisir un email valide pour recevoir votre confirmation.');
      return;
    }

    // Bloquer le checkout si exécuté dans une iframe (preview)
    if (window.self !== window.top) {
      setError("Le paiement sécurisé n'est disponible que depuis l'application publiée. Ouvrez l'app dans un nouvel onglet.");
      return;
    }

    setLoading(true);
    try {
      const res = await base44.functions.invoke('createCheckoutSession', {
        items,
        email,
        plan
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setError(res.data?.error || "Erreur lors de l'initialisation du paiement.");
      }
    } catch (e) {
      setError(e.message || "Erreur de connexion au système de paiement.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaypal = async () => {
    setError('');
    if (items.length === 0) return;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Veuillez saisir un email valide pour recevoir votre confirmation.');
      return;
    }
    if (window.self !== window.top) {
      setError("Le paiement sécurisé n'est disponible que depuis l'application publiée. Ouvrez l'app dans un nouvel onglet.");
      return;
    }
    setLoading(true);
    try {
      const res = await base44.functions.invoke('createPaypalOrder', { items, email, plan });
      if (res.data?.approval_url) {
        window.location.href = res.data.approval_url;
      } else {
        setError(res.data?.error || "Erreur lors de l'initialisation de PayPal.");
      }
    } catch (e) {
      setError(e.message || "Erreur de connexion à PayPal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">Votre coffre</h1>
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-cyan-400">
          <ArrowLeft className="h-4 w-4" /> Continuer
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-border bg-card py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center border border-cyan-400/30 bg-cyan-500/10">
            <ShieldCheck className="h-8 w-8 text-cyan-400" />
          </div>
          <h2 className="mt-6 font-heading text-xl text-foreground">Votre panier est vide</h2>
          <p className="mt-2 text-sm text-muted-foreground">Découvrez nos best-sellers protégés et ajoutés en toute sécurité.</p>
          <Link to="/" className="mt-6 bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground">
            Voir les best-sellers
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-3">
          {/* Items */}
          <div className="md:col-span-2 space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-4 border border-border bg-card p-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden bg-secondary">
                  <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-sm font-semibold text-foreground">{item.name}</h3>
                  <p className="mt-1 text-sm text-cyan-400">{item.price}€</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => dispatch({ type: 'SET_QTY', id: item.id, quantity: item.quantity - 1 })}
                      className="flex h-6 w-6 items-center justify-center border border-border text-foreground hover:border-cyan-400/50"
                    >−</button>
                    <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => dispatch({ type: 'SET_QTY', id: item.id, quantity: item.quantity + 1 })}
                      className="flex h-6 w-6 items-center justify-center border border-border text-foreground hover:border-cyan-400/50"
                    >+</button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className="font-display font-bold text-foreground">{(item.price * item.quantity).toFixed(2)}€</span>
                  <button onClick={() => dispatch({ type: 'REMOVE', id: item.id })} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Vault checkout */}
          <div className="md:col-span-1">
            <div className="sticky top-24 border border-cyan-400/30 bg-card p-6">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-400">
                <Activity className="h-3 w-3 pulse-security" />
                Mode Coffre · Paiement sécurisé
              </div>

              <div className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Sous-total</span>
                  <span>{total.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Livraison</span>
                  <span className="text-cyan-400">Offerte</span>
                </div>
                <div className="my-3 h-px bg-border" />
                <div className="flex justify-between font-display text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span>{total.toFixed(2)}€</span>
                </div>
              </div>

              {/* Plan de paiement */}
              <div className="mt-5">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Modalité de paiement</label>
                <div className="mt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => setPlan('full')}
                    className={`flex w-full items-center justify-between border px-3 py-2.5 text-sm transition-colors ${plan === 'full' ? 'border-cyan-400 bg-cyan-500/10 text-foreground' : 'border-border text-muted-foreground hover:border-cyan-400/40'}`}
                  >
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Paiement intégral
                    </span>
                    <span className="font-semibold">{total.toFixed(2)}€</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlan('3x')}
                    className={`flex w-full flex-col items-start border px-3 py-2.5 text-sm transition-colors ${plan === '3x' ? 'border-cyan-400 bg-cyan-500/10 text-foreground' : 'border-border text-muted-foreground hover:border-cyan-400/40'}`}
                  >
                    <span className="flex items-center gap-2">
                      <Activity className="h-4 w-4" /> 3x sans frais
                    </span>
                    <span className="mt-0.5 text-xs text-cyan-400">3 × {installment.toFixed(2)}€</span>
                  </button>
                </div>
              </div>

              <div className="mt-5">
                <label className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" /> Email de confirmation
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="scan-border mt-5 flex w-full items-center justify-center gap-2 bg-primary py-4 text-sm font-bold uppercase tracking-wider text-primary-foreground pulse-security disabled:opacity-60"
              >
                {loading ? (
                  <><Activity className="h-4 w-4 animate-pulse" /> Connexion au coffre...</>
                ) : (
                  <><Lock className="h-4 w-4" /> Payer {total.toFixed(2)}€ en sécurité</>
                )}
              </button>

              <div className="my-2 flex items-center gap-2">
                <span className="h-px flex-1 bg-border" />
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">ou</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <button
                onClick={handlePaypal}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 border border-[#0070ba] bg-[#ffc439] py-3.5 text-sm font-bold uppercase tracking-wider text-[#003087] transition-colors hover:bg-[#ffb800] disabled:opacity-60"
              >
                <Wallet className="h-4 w-4" /> Payer avec PayPal
              </button>

              <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                <Wallet className="h-3 w-3" /> Apple Pay · Google Pay
                <span className="text-muted-foreground/40">|</span>
                <CreditCard className="h-3 w-3" />
                Chiffrement SSL 256-bit · Stripe
              </div>
              <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3 w-3 text-cyan-400" />
                Garantie remboursement 30 jours
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}