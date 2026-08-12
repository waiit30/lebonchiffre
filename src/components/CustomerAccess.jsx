import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, UserCheck, ShieldCheck, ArrowRight, ShoppingBag, Mail, Lock, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useCart } from '@/lib/cartStore';

export default function CustomerAccess() {
  const { count } = useCart();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await base44.entities.Customer.create({ name, email, password });
      setCreated(true);
    } catch (err) {
      setError(err?.message?.includes?.('already') || err?.message?.includes?.('duplicate')
        ? 'Un compte existe déjà avec cet email.'
        : 'Impossible de créer le compte. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="compte" className="border-y border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400">
            <ShieldCheck className="h-3 w-3" /> Accès au coffre client
          </span>
          <h2 className="mx-auto mt-6 max-w-2xl font-display text-3xl font-bold text-foreground md:text-4xl">
            Créez un compte ou commandez en invité
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Un compte client vous permet de suivre vos commandes et d'accélérer vos achats futurs. L'achat invité reste disponible, tout aussi sécurisé.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* CRÉER UN COMPTE */}
          <div className="relative border border-border bg-background/50 p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-cyan-400/30 bg-cyan-500/10">
                <UserPlus className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-foreground">Créer un compte client</h3>
                <p className="text-xs text-muted-foreground">Suivez vos commandes et profitez d'un paiement express.</p>
              </div>
            </div>

            {created ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center border border-cyan-400/40 bg-cyan-500/10 pulse-security">
                  <UserCheck className="h-7 w-7 text-cyan-400" />
                </div>
                <h4 className="font-heading text-lg font-semibold text-foreground">Compte créé</h4>
                <p className="max-w-xs text-sm text-muted-foreground">
                  Bienvenue {name.split(' ')[0]}. Vous pouvez désormais commander et suivre vos achats.
                </p>
                <Link to="/panier" className="scan-border mt-2 inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                  Accéder au panier <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Nom complet</label>
                  <div className="flex items-center border border-border bg-background focus-within:border-cyan-400/50">
                    <User className="ml-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jean Dupont"
                      className="w-full bg-transparent px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Email</label>
                  <div className="flex items-center border border-border bg-background focus-within:border-cyan-400/50">
                    <Mail className="ml-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jean@exemple.com"
                      className="w-full bg-transparent px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Mot de passe</label>
                  <div className="flex items-center border border-border bg-background focus-within:border-cyan-400/50">
                    <Lock className="ml-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>

                {error && <p className="text-xs text-destructive">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="scan-border mt-2 flex w-full items-center justify-center gap-2 bg-primary py-3 text-xs font-semibold uppercase tracking-wider text-primary-foreground disabled:opacity-50"
                >
                  {submitting ? 'Création…' : 'Créer mon compte'} {!submitting && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            )}
          </div>

          {/* ACHAT INVITÉ */}
          <div className="relative flex flex-col border border-border bg-background/50 p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-cyan-400/30 bg-cyan-500/10">
                <ShoppingBag className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-foreground">Achat invité</h3>
                <p className="text-xs text-muted-foreground">Commandez sans compte, paiement 100% sécurisé.</p>
              </div>
            </div>

            <ul className="flex-1 space-y-3 text-sm text-muted-foreground">
              {[
                'Aucune inscription requise, paiement immédiat.',
                'Vos données bancaaires chiffrées SSL 256-bit.',
                'Recevez votre confirmation par email après paiement.',
                'Possibilité de créer un compte plus tard si vous le souhaitez.',
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/panier"
              className="scan-border mt-6 flex items-center justify-center gap-2 border border-cyan-400/40 py-3 text-xs font-semibold uppercase tracking-wider text-cyan-400 transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary"
            >
              Continuer en invité <ArrowRight className="h-4 w-4" />
            </Link>
            {count > 0 && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {count} article{count > 1 ? 's' : ''} déjà dans votre panier.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}