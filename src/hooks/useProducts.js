import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Clé de cache partagée pour tout le catalogue produits.
// Toutes les pages (Accueil, Catalogue, fiches) partagent ce cache → navigation instantanée.
export const PRODUCTS_KEY = ['products', 'all'];

const STALE = 5 * 60 * 1000; // 5 minutes : les données restent fraîches sans refetch systématique

// Charge et met en cache l'ensemble du catalogue (trié par ventes).
export function useProducts(limit = 200) {
  return useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: () => base44.entities.Product.list('-units_sold', limit),
    staleTime: STALE,
    placeholderData: (prev) => prev, // garde l'ancien affichage pendant le refetch (pas de flash)
  });
}

// Charge un produit individuel (mis en cache, partagé avec le préchargement au survol).
export function useProduct(id) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => base44.entities.Product.get(id),
    enabled: !!id,
    staleTime: STALE,
  });
}

// Renvoie un gestionnaire à appeler onMouseEnter d'une carte produit :
// précharge la fiche en arrière-plan → ouverture quasi instantanée.
export function usePrefetchProduct() {
  const qc = useQueryClient();
  return (id) => {
    if (!id) return;
    qc.prefetchQuery({
      queryKey: ['product', id],
      queryFn: () => base44.entities.Product.get(id),
      staleTime: STALE,
    });
  };
}