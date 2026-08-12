import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ShoppingBag, Menu, X, DollarSign, Bot, Search } from 'lucide-react';
import { useCart } from '@/lib/cartStore';

export default function Navbar() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const submitSearch = (e) => {
    e.preventDefault();
    const term = query.trim();
    if (!term) return;
    setOpen(false);
    navigate(`/recherche?q=${encodeURIComponent(term)}`);
  };

  const links = [
    { label: "High-Tech", to: "/?cat=high_tech" },
    { label: "Maison", to: "/?cat=maison" },
    { label: "Mode", to: "/?cat=mode" },
    { label: "Explication", to: "/explication" },
    { label: "Gestion IA", to: "/gestion" },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center border border-cyan-400/40 bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            lebon<span className="text-cyan-400">chiffre</span><DollarSign className="inline h-4 w-4 -ml-0.5 text-yellow-400" strokeWidth={3} />
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map(l => (
            <Link key={l.to} to={l.to} className="text-sm font-medium text-muted-foreground transition-colors hover:text-cyan-400">
              {l.label}
            </Link>
          ))}
          <form onSubmit={submitSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher…"
              className="w-44 border border-border bg-card py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-cyan-400/50 lg:w-56"
            />
          </form>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/gestion" className="flex items-center gap-2 border border-cyan-400/40 bg-cyan-500/5 px-3 py-2 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-500/10" title="Espace de gestion IA">
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">Gestion IA</span>
          </Link>
          <Link to="/panier" className="relative flex items-center gap-2 border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-cyan-400/50">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Panier</span>
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center bg-cyan-400 px-1 text-[10px] font-bold text-background">{count}</span>
            )}
          </Link>
          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border px-4 py-4 md:hidden">
          <form onSubmit={submitSearch} className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit…"
              className="w-full border border-border bg-card py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-cyan-400/50"
            />
          </form>
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block py-2 text-sm text-muted-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}