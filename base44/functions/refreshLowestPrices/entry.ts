import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    const products = await base44.asServiceRole.entities.Product.list('-units_sold', 50);

    if (!products.length) {
      return Response.json({ updated: 0, failed: 0, total: 0, items: [] });
    }

    const MARGIN_PERCENT = 0.06; // 6 % de marge par produit — rémunération du site (modèle dropshipping)

    // Un seul appel LLM groupé pour tous les produits (évite 50 appels séquentiels = timeout)
    const catalog = products.map((p, i) => `${i + 1}. ${p.name} (catégorie: ${p.category})`).join('\n');
    const prompt = `Tu es un comparateur de prix indépendant. Pour CHACUN des ${products.length} produits listés ci-dessous, recherche sur les principaux sites de e-commerce (Amazon, Cdiscount, Fnac, Darty, Boulanger, Rue du Commerce, Rakuten, etc.) le prix de vente public le plus bas actuellement constaté en euros.

Produits:
${catalog}

Réponds uniquement avec un objet JSON contenant une clé "results": un tableau de ${products.length} objets, chacun avec "index" (numéro du produit) et "lowest_price" (prix le plus bas trouvé en euros, nombre décimal ex: 199.99, ou 0 si aucune donnée fiable). L'ordre doit correspondre à la liste ci-dessus.`;

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          results: {
            type: "array",
            items: {
              type: "object",
              properties: {
                index: { type: "number" },
                lowest_price: { type: "number" }
              },
              required: ["index", "lowest_price"]
            }
          }
        },
        required: ["results"]
      }
    });

    const results = Array.isArray(res?.results) ? res.results : [];

    const updated = [];
    let failed = 0;

    for (const r of results) {
      const idx = Number(r.index);
      const product = products[idx - 1];
      const lowest = Number(r.lowest_price);
      if (!product || !(lowest > 0)) continue;

      try {
        const newPrice = Math.round((lowest * (1 + MARGIN_PERCENT)) * 100) / 100;
        await base44.asServiceRole.entities.Product.update(product.id, {
          old_price: product.price,
          price: newPrice,
          cost_price: lowest // prix fournisseur (prix bas du marché) — sert au calcul de marge nette
        });
        updated.push({ id: product.id, name: product.name, before: product.price, found: lowest, after: newPrice, margin: Math.round((newPrice - lowest) * 100) / 100 });
      } catch (e) {
        console.error(`Update error for ${product.name}:`, e.message);
        failed++;
      }
    }

    return Response.json({ updated: updated.length, failed, total: products.length, items: updated });
  } catch (error) {
    console.error("Refresh prices error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}