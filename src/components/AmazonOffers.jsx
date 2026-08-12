import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ShoppingBag, Loader2, ExternalLink, TrendingDown, RefreshCw } from 'lucide-react';

export default function AmazonOffers({ productName, ourPrice }) {
  const { data: offers, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['amazonOffers', productName],
    queryFn: async () => {
      const res = await base44.functions.invoke('fetchAmazonOffers', { productName });
      return res.data;
    },
    enabled: !!productName,
    staleTime: 60 * 60 * 1000, // 1h : les offres restent en cache, re-visite instantanée
    placeholderData: (prev) => prev, // pas de flash pendant le refetch
    retry: 1,
  });

  return (
    <div className="mt-6 border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-cyan-400" />
          <h3 className="font-heading text-sm font-semibold text-foreground">Offres des revendeurs Amazon</h3>
        </div>
        {offers && !isLoading && (
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 border border-cyan-400/40 px-3 py-1.5 hover:bg-cyan-500/10 transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Actualisation…' : 'Rafraîchir'}
          </button>
        )}
      </div>

      {(isLoading || isFetching) && !offers && (
        <div className="mt-4">
          <div className="mb-3 flex items-center gap-2 rounded bg-cyan-500/10 px-3 py-2 text-sm">
            <TrendingDown className="h-4 w-4 animate-pulse text-cyan-400" />
            <span className="text-muted-foreground">Analyse des meilleures offres en cours…</span>
          </div>
          <div className="divide-y divide-border">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex items-center justify-between py-2.5 animate-pulse">
                <div className="space-y-1.5">
                  <div className="h-3.5 w-32 rounded bg-secondary" />
                  <div className="h-3 w-24 rounded bg-secondary/70" />
                </div>
                <div className="h-4 w-12 rounded bg-secondary" />
              </div>
            ))}
          </div>
        </div>
      )}

      {isError && !offers && <p className="mt-4 text-sm text-destructive">Comparaison indisponible pour le moment.</p>}

      {offers && (
        <div className="mt-4">
          {offers.lowest_price != null && (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded bg-cyan-500/10 px-3 py-2 text-sm">
              <TrendingDown className="h-4 w-4 text-cyan-400" />
              Meilleur prix Amazon : <b className="text-cyan-400">{offers.lowest_price}€</b>
              {ourPrice != null && ourPrice <= offers.lowest_price && (
                <span className="text-xs text-cyan-400">— Notre prix est le plus bas !</span>
              )}
            </div>
          )}
          {(!offers.offers || offers.offers.length === 0) ? (
            <p className="text-sm text-muted-foreground">Aucune offre revendeur trouvée pour ce produit.</p>
          ) : (
            <ul className="divide-y divide-border">
              {offers.offers.map((o, i) => (
                <li key={i} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{o.seller || "Vendeur Amazon"}</p>
                    <p className="text-xs text-muted-foreground">{o.condition || "Neuf"}{o.rating ? ` · ${o.rating}/5` : ""}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-foreground">{o.price}€</span>
                    {o.url && (
                      <a href={o.url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-[11px] text-muted-foreground">Offres indicatives récupérées en temps réel via recherche web. Prix susceptibles d'évoluer sur Amazon.</p>
        </div>
      )}
    </div>
  );
}