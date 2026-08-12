import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProduct } from '@/hooks/useProducts';
import { ShieldCheck, Lock, Truck, RotateCcw, Activity, Star, TrendingUp, Check, ArrowLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/lib/cartStore';
import AmazonOffers from '@/components/AmazonOffers';
import ProductGallery from '@/components/ProductGallery';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useCart();
  const { data: product, isLoading: loading } = useProduct(id);
  const [scanning, setScanning] = useState(false);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Produit introuvable.</p>
        <Link to="/" className="text-cyan-400 hover:underline">Retour à l'accueil</Link>
      </div>
    );
  }

  const securityStack = [
    { icon: Lock, label: "Paiement chiffré 256-bit" },
    { icon: ShieldCheck, label: "Garantie remboursement 30 jours" },
    { icon: Truck, label: "Livraison suivie 24-48h offerte" },
    { icon: RotateCcw, label: "Retour gratuit sous 30 jours" },
  ];

  const handleBuy = () => {
    dispatch({ type: 'ADD', product });
    setScanning(true);
    setTimeout(() => { setScanning(false); navigate('/panier'); }, 900);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-cyan-400">Accueil</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="capitalize">{product.category}</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Galerie photos */}
        <div className="md:sticky md:top-24 md:self-start">
          <div className="relative">
            {product.badge && (
              <span className="absolute left-4 top-4 z-10 bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground pulse-security">
                {product.badge}
              </span>
            )}
            <div className="absolute right-4 top-4 z-10 flex items-center gap-1 bg-background/80 px-2 py-1 text-[11px] font-medium text-cyan-400 backdrop-blur-sm">
              <TrendingUp className="h-3 w-3" />
              {product.units_sold?.toLocaleString('fr-FR')} vendus
            </div>
            <ProductGallery product={product} />
          </div>
        </div>

        {/* Security stack */}
        <div>
          <span className="text-xs uppercase tracking-widest text-cyan-400">{product.category}</span>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-foreground md:text-4xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(n => (
                <Star key={n} className={`h-4 w-4 ${n <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-border"}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">{product.rating?.toFixed(1)} · {product.reviews} avis vérifiés</span>
          </div>

          <div className="mt-5 flex items-end gap-3">
            {product.old_price && <span className="text-lg text-muted-foreground line-through">{product.old_price}€</span>}
            <span className="font-display text-4xl font-bold text-foreground">{product.price}€</span>
            <span className="mb-1 text-sm text-muted-foreground">TTC</span>
          </div>

          <p className="mt-5 text-base leading-relaxed text-muted-foreground">{product.description}</p>

          {product.features?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-heading text-xs uppercase tracking-widest text-cyan-400">Caractéristiques</h3>
              <ul className="mt-3 space-y-2">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Offres revendeurs Amazon */}
          <AmazonOffers productName={product.name} ourPrice={product.price} />

          {/* Live vault status */}
          <div className="mt-6 border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-400">
              <Activity className="h-3 w-3 pulse-security" />
              Statut du coffre en direct
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Stock disponible</span>
              <span className={`font-medium ${product.stock > 10 ? "text-cyan-400" : "text-amber-400"}`}>
                {product.stock > 10 ? "En stock" : `Plus que ${product.stock}`}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Passerelle de paiement</span>
              <span className="flex items-center gap-1 font-medium text-cyan-400">
                <span className="h-2 w-2 rounded-full bg-cyan-400 pulse-security" />
                Opérationnelle
              </span>
            </div>
          </div>

          {/* Security stack */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {securityStack.map((s, i) => (
              <div key={i} className="flex items-center gap-2 border border-border bg-card px-3 py-3 text-xs text-muted-foreground">
                <s.icon className="h-4 w-4 shrink-0 text-cyan-400" />
                {s.label}
              </div>
            ))}
          </div>

          {/* Buy button with security perimeter */}
          <div className="mt-8 scan-border border border-cyan-400/40 p-1">
            <button
              onClick={handleBuy}
              disabled={scanning}
              className="relative flex w-full items-center justify-center gap-2 bg-primary py-4 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-all hover:bg-cyan-500 disabled:opacity-70"
            >
              {scanning ? (
                <><Activity className="h-4 w-4 animate-pulse" /> Sécurisation en cours...</>
              ) : (
                <><ShieldCheck className="h-4 w-4" /> Acheter — Paiement sécurisé</>
              )}
            </button>
          </div>

          <button
            onClick={() => dispatch({ type: 'ADD', product })}
            className="mt-3 w-full border border-border py-3 text-sm font-medium text-foreground hover:border-cyan-400/50"
          >
            Ajouter au panier
          </button>

          <Link to="/" className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-cyan-400">
            <ArrowLeft className="h-3 w-3" /> Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}