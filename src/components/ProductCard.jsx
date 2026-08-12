import React from 'react';
import { Link } from 'react-router-dom';
import { Star, TrendingUp, ShieldCheck } from 'lucide-react';
import { useCart } from '@/lib/cartStore';
import { usePrefetchProduct } from '@/hooks/useProducts';
import { Image } from '@/components/ui/image';

const categoryLabel = { high_tech: "High-Tech", maison: "Maison", mode: "Mode" };

export default function ProductCard({ product }) {
  const { dispatch } = useCart();
  const prefetch = usePrefetchProduct();

  return (
    <Link
      to={`/produit/${product.id}`}
      onMouseEnter={() => prefetch(product.id)}
      onFocus={() => prefetch(product.id)}
      className="group relative flex shrink-0 w-[280px] snap-start flex-col overflow-hidden border border-border bg-card transition-colors duration-300 hover:border-primary/60"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <Image
          src={product.image_url}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          fittingType="fill"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground pulse-security">
            {product.badge}
          </span>
        )}
        <div className="absolute right-3 top-3 flex items-center gap-1 bg-background/80 px-2 py-1 text-[11px] font-medium text-cyan-400 backdrop-blur-sm">
          <TrendingUp className="h-3 w-3" />
          {product.units_sold?.toLocaleString('fr-FR')} vendus
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{categoryLabel[product.category]}</span>
        <h3 className="mt-1 font-heading text-base font-semibold leading-tight text-foreground">{product.name}</h3>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span>{product.rating?.toFixed(1)}</span>
          <span className="text-muted-foreground/50">·</span>
          <span>{product.reviews} avis</span>
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div>
            {product.old_price && (
              <span className="mr-2 text-xs text-muted-foreground line-through">{product.old_price}€</span>
            )}
            <span className="font-display text-xl font-bold text-foreground">{product.price}€</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-medium text-cyan-400">
            <ShieldCheck className="h-3 w-3" />
            Sécurisé
          </span>
        </div>

        <button
          onClick={(e) => { e.preventDefault(); dispatch({ type: 'ADD', product }); }}
          className="scan-border mt-3 flex items-center justify-center gap-2 bg-primary/0 py-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-400/40 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary"
        >
          Ajouter au panier
        </button>
      </div>
    </Link>
  );
}