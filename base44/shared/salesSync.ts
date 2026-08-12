// Synchronisation post-vente : décrémente le stock, incrémente les unités vendues
// et recalcule le classement best-seller. Partagé entre le webhook Stripe et la
// capture PayPal pour garantir un comportement identique quel que soit le moyen de paiement.

export async function applySale(base44, order) {
  if (!order || !Array.isArray(order.items) || order.items.length === 0) {
    return { synced: 0, ranked: false };
  }

  let synced = 0;
  for (const item of order.items) {
    const pid = item.product_id;
    if (!pid) continue;
    try {
      const product = await base44.asServiceRole.entities.Product.get(pid);
      if (!product) continue;
      const qty = item.quantity || 0;
      const newStock = Math.max(0, (product.stock || 0) - qty);
      const newSold = (product.units_sold || 0) + qty;
      await base44.asServiceRole.entities.Product.update(pid, {
        stock: newStock,
        units_sold: newSold
      });
      synced++;
    } catch (e) {
      console.error(`salesSync product ${pid}:`, e.message);
    }
  }

  // Recalcul du classement best-seller sur l'ensemble du catalogue (tri par ventes)
  let ranked = false;
  try {
    const all = await base44.asServiceRole.entities.Product.list('-units_sold', 200);
    if (all.length) {
      await base44.asServiceRole.entities.Product.bulkUpdate(
        all.map((p, i) => ({ id: p.id, rank: i + 1 }))
      );
      ranked = true;
    }
  } catch (e) {
    console.error("salesSync rank recompute:", e.message);
  }

  return { synced, ranked };
}

// Remboursement : réincrémente le stock et décrémente les unités vendues,
// puis recalcule le classement. Inverse de applySale.
export async function refundSale(base44, order) {
  if (!order || !Array.isArray(order.items) || order.items.length === 0) {
    return { synced: 0, ranked: false };
  }

  let synced = 0;
  for (const item of order.items) {
    const pid = item.product_id;
    if (!pid) continue;
    try {
      const product = await base44.asServiceRole.entities.Product.get(pid);
      if (!product) continue;
      const qty = item.quantity || 0;
      const newStock = (product.stock || 0) + qty;
      const newSold = Math.max(0, (product.units_sold || 0) - qty);
      await base44.asServiceRole.entities.Product.update(pid, {
        stock: newStock,
        units_sold: newSold
      });
      synced++;
    } catch (e) {
      console.error(`refundSale product ${pid}:`, e.message);
    }
  }

  let ranked = false;
  try {
    const all = await base44.asServiceRole.entities.Product.list('-units_sold', 200);
    if (all.length) {
      await base44.asServiceRole.entities.Product.bulkUpdate(
        all.map((p, i) => ({ id: p.id, rank: i + 1 }))
      );
      ranked = true;
    }
  } catch (e) {
    console.error("refundSale rank recompute:", e.message);
  }

  return { synced, ranked };
}