import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { productName } = body;
    if (!productName) return Response.json({ error: "productName manquant" }, { status: 400 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Tu es un comparateur de prix e-commerce. Recherche sur Amazon.fr les offres réelles des revendeurs tiers pour le produit suivant : "${productName}". Identifie les 3 à 5 meilleures offres disponibles (produit neuf ou reconditionné), avec le nom du vendeur, le prix en EUR, l'état, la note du vendeur sur 5 si disponible, et l'URL de l'offre Amazon si trouvée. Réponds uniquement via le schéma JSON demandé. Si tu ne trouves pas d'offres réelles fiables, retourne un tableau offers vide et lowest_price null.`,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          offers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                seller: { type: "string" },
                price: { type: "number" },
                condition: { type: "string" },
                rating: { type: "string" },
                url: { type: "string" }
              }
            }
          },
          lowest_price: { type: "number" }
        }
      }
    });
    return Response.json(result);
  } catch (error) {
    console.error("fetchAmazonOffers error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}