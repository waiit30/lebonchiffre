import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { Search, Cpu, Home as HomeIcon, Gem } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

const catLabel = { high_tech: "High-Tech", maison: "Maison", mode: "Mode" };
const catIcon = { high_tech: Cpu, maison: HomeIcon, mode: Gem };

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const cat = searchParams.get('cat') || '';
  const { data: products = [], isLoading: loading } = useProducts();
  const [input, setInput] = useState(q);

  useEffect(() => { setInput(q); }, [q]);

  // Recherche live à la frappe : filtrage local instantané (milliseconde), aucune requête réseau
  const filtered = useMemo(() => {
    const term = input.trim().toLowerCase();
    return products.filter(p => {
      const matchCat = !cat || p.category === cat;
      const matchQ = !term ||
        p.name?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.badge?.toLowerCase().includes(term);
      return matchCat && matchQ;
    });
  }, [products, input, cat]);

  const submitSearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (input.trim()) next.set('q', input.trim()); else next.delete('q');
    setSearchParams(next);
  };

  const setCat = (c) => {
    const next = new URLSearchParams(searchParams);
    if (c) next.set('cat', c); else next.delete('cat');
    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <div className="mb-6">
        <span className="text-xs uppercase tracking-widest text-cyan-400">Catalogue</span>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">Rechercher dans le catalogue</h1>
        <p className="mt-2 text-sm text-muted-foreground">Trouvez le meilleur prix parmi nos accessoires neufs, et comparez aux offres des revendeurs Amazon.</p>
      </div>

      {/* Search bar */}
      <form onSubmit={submitSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Rechercher un produit, une marque, une référence…"
            className="w-full border border-border bg-card py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-400/50"
          />
        </div>
        <button type="submit" className="bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-cyan-500 transition-colors">Rechercher</button>
      </form>

      {/* Category filters */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button onClick={() => setCat('')} className={!cat ? "border border-cyan-400 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-400" : "border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:border-cyan-400/40"}>Tous</button>
        {Object.entries(catLabel).map(([key, label]) => {
          const Icon = catIcon[key];
          return (
            <button key={key} onClick={() => setCat(key)} className={cat === key ? "flex items-center gap-1.5 border border-cyan-400 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-400" : "flex items-center gap-1.5 border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:border-cyan-400/40"}>
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <p className="text-sm text-muted-foreground">{loading ? "Chargement…" : `${filtered.length} produit(s) trouvé(s)`}</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><div className="h-10 w-10 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="mt-10 text-center text-muted-foreground">
          <p>Aucun produit ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}