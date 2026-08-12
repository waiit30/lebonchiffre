import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { ShieldCheck, Lock, Activity, ArrowRight, TrendingUp, Cpu, Home as HomeIcon, Gem, CalendarClock } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import SecurityBadges from '@/components/SecurityBadges';
import CustomerAccess from '@/components/CustomerAccess';
import { Image } from '@/components/ui/image';
import { useCart } from '@/lib/cartStore';

const catIcon = { high_tech: Cpu, maison: HomeIcon, mode: Gem };
const catLabel = { high_tech: "High-Tech Premium", maison: "Maison Tendance", mode: "Mode & Accessoires" };

export default function Home() {
  const { data: products = [], isLoading: loading } = useProducts();
  const [searchParams] = useSearchParams();
  const activeCat = searchParams.get('cat');
  const { dispatch } = useCart();

  const topProduct = products[0];
  const categories = ['high_tech', 'maison', 'mode'];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* HERO */}
      {topProduct && (
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute -top-1/4 left-1/2 h-2/3 w-2/3 -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-1/2 w-1/2 rounded-full bg-cyan-500/10 blur-[100px]" />
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-2 md:px-8 md:py-24">
            {/* Trust index */}
            <div className="flex flex-col justify-center">
              <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl">
                Le seul site de recherche dont vous avez besoin, pour <span className="text-cyan-400">tout</span> ce dont vous avez besoin.
              </h1>
              <p className="mt-5 max-w-md text-base text-muted-foreground">
                Imaginez un peu Le Bon Coin… mais uniquement pour des accessoires neufs. High-Tech, Maison et Mode : comparez les prix les plus bas du marché, en toute sécurité.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={`/produit/${topProduct.id}`} className="scan-border inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground pulse-security">
                  Découvrir le N°1 <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#galerie" className="inline-flex items-center gap-2 border border-border px-6 py-3 text-sm font-semibold uppercase tracking-wider text-foreground hover:border-cyan-400/50">
                  Voir la galerie
                </a>
              </div>
              <div className="mt-10">
                <SecurityBadges compact />
              </div>
            </div>

            {/* Top product visual */}
            <div className="relative flex items-center justify-center">
              <div className="absolute h-64 w-64 rounded-full bg-primary/20 blur-3xl md:h-80 md:w-80" />
              <Link to={`/produit/${topProduct.id}`} className="group relative z-10 w-full max-w-sm border border-border bg-card p-6">
                <div className="absolute -top-3 left-6 bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                  Best-seller N°1
                </div>
                <div className="relative aspect-square overflow-hidden bg-secondary">
                  <Image src={topProduct.image_url} alt={topProduct.name} className="h-full w-full object-cover" fittingType="fill" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">{topProduct.name}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-display text-2xl font-bold text-foreground">{topProduct.price}€</span>
                  <span className="flex items-center gap-1 text-xs text-cyan-400">
                    <TrendingUp className="h-3 w-3" />
                    {topProduct.units_sold?.toLocaleString('fr-FR')} vendus
                  </span>
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); dispatch({ type: 'ADD', product: topProduct }); }}
                  className="mt-4 w-full bg-primary/0 py-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-400/40 transition-all hover:bg-primary hover:text-primary-foreground"
                >
                  Ajouter — Paiement sécurisé
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* BANDEAU 3X SANS FRAIS */}
      <section className="border-b border-cyan-400/20 bg-cyan-500/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-6 md:flex-row md:justify-center md:px-8">
          <div className="flex items-center gap-3 text-foreground">
            <div className="flex h-10 w-10 items-center justify-center border border-cyan-400/40 bg-cyan-500/10 pulse-security">
              <CalendarClock className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="font-heading text-base font-semibold md:text-lg">
              Profitez du <span className="text-cyan-400">paiement en 3x sans frais</span> sur tous vos achats
            </span>
          </div>
          <span className="hidden h-px w-8 bg-cyan-400/30 md:block" />
          <span className="text-xs text-muted-foreground md:text-sm">
            Réglez en 3 versements égaux, 0% d'intérêts · Apple Pay & Google Pay acceptés
          </span>
        </div>
      </section>

      {/* GALERIE PAR UNIVERS */}
      <section id="galerie" className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-cyan-400">Galerie d'excellence</span>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">Top vendeurs par univers</h2>
          </div>
          <Lock className="h-5 w-5 text-cyan-400/50" />
        </div>

        {categories.map(cat => {
          const catProducts = products.filter(p => p.category === cat).slice(0, 20);
          if (catProducts.length === 0) return null;
          const Icon = catIcon[cat];
          return (
            <div key={cat} className="mb-16">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-cyan-400/30 bg-cyan-500/10">
                  <Icon className="h-5 w-5 text-cyan-400" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground">{catLabel[cat]}</h3>
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">{catProducts.length} best-sellers</span>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {catProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          );
        })}
      </section>

      {/* COMPTE / ACHAT INVITÉ */}
      <CustomerAccess />

      {/* SECTION CONFIANCE */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400">
              <ShieldCheck className="h-3 w-3" /> Sécurité de paiement élevée
            </span>
            <h2 className="mx-auto mt-6 max-w-2xl font-display text-3xl font-bold text-foreground md:text-4xl">
              Chaque achat est scellé dans une enceinte de confiance
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Lock, title: "Chiffrement 256-bit", desc: "Vos données bancaires transitent par un tunnel SSL AES-256, identique à celui des institutions financières." },
              { icon: ShieldCheck, title: "Conformité PCI-DSS", desc: "Notre infrastructure de paiement est certifiée PCI-DSS Level 1, le plus haut standard de sécurité du secteur." },
              { icon: Activity, title: "Surveillance temps réel", desc: "Chaque transaction est analysée en continu par nos systèmes anti-fraude, 24h/24 et 7j/7." },
            ].map((f, i) => (
              <div key={i} className="border border-border bg-background/50 p-6">
                <div className="flex h-12 w-12 items-center justify-center border border-cyan-400/30 bg-cyan-500/10">
                  <f.icon className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="mt-5 font-heading text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 border border-border bg-background/50 p-6">
            <SecurityBadges />
          </div>
        </div>
      </section>
    </div>
  );
}