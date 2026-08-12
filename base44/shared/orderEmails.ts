// Helpers d'envoi d'e-mails liés aux commandes — partagés entre le webhook Stripe
// (envoi automatique) et la fonction sendOrderFollowup (relance par l'agent).

function shortId(id) {
  return (id || "").slice(-6).toUpperCase();
}

export async function sendOrderFollowupEmail(base44, order) {
  if (!order || !order.email) return { sent: false, reason: "no_email" };
  const rows = (order.items || [])
    .map(i => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${i.price}€</td></tr>`)
    .join("");
  const body = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;color:#0f172a">
      <h2 style="color:#06b6d4">Merci pour votre commande !</h2>
      <p>Bonjour,<br>votre commande <b>#${shortId(order.id)}</b> a bien été confirmée et payée.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr style="background:#f1f5f9"><th style="text-align:left;padding:8px">Article</th><th style="padding:8px">Qté</th><th style="padding:8px;text-align:right">Prix</th></tr>
        ${rows}
      </table>
      <p style="font-size:18px"><b>Total : ${order.total}€</b></p>
      <p>Vous recevrez prochainement l'expédition de votre colis avec son suivi. Pour toute question, notre assistant IA est disponible directement sur le site.</p>
      <p style="color:#64748b;font-size:12px;margin-top:24px">lebonchiffre — paiements sécurisés · paiement en 3x sans frais</p>
    </div>`;
  await base44.asServiceRole.integrations.Core.SendEmail({
    to: order.email,
    subject: `Confirmation de votre commande lebonchiffre #${shortId(order.id)}`,
    body
  });
  return { sent: true };
}

export async function sendSaleNotificationEmail(base44, order, ownerEmail) {
  if (!ownerEmail) return { sent: false, reason: "no_owner_email" };
  if (!order) return { sent: false, reason: "no_order" };
  const itemsTxt = (order.items || [])
    .map(i => `${i.name} ×${i.quantity} (${i.price}€)`)
    .join(", ");
  const body = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;color:#0f172a">
      <h2 style="color:#06b6d4">💰 Nouvelle vente !</h2>
      <p>Une commande vient d'être payée sur lebonchiffre.</p>
      <p>
        <b>Commande :</b> #${shortId(order.id)}<br>
        <b>Client :</b> ${order.email || "n/a"}<br>
        <b>Total :</b> ${order.total}€<br>
        <b>Articles :</b> ${itemsTxt}
      </p>
      <p style="color:#64748b;font-size:12px;margin-top:24px">Notification automatique lebonchiffre</p>
    </div>`;
  await base44.asServiceRole.integrations.Core.SendEmail({
    to: ownerEmail,
    subject: `💰 Nouvelle vente lebonchiffre — ${order.total}€`,
    body
  });
  return { sent: true };
}

export async function sendAbandonedCartEmail(base44, order) {
  if (!order || !order.email) return { sent: false, reason: "no_email" };
  const rows = (order.items || [])
    .map(i => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${i.price}€</td></tr>`)
    .join("");
  const total = (order.items || []).reduce((s, i) => s + i.price * i.quantity, 0);
  const body = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;color:#0f172a">
      <h2 style="color:#06b6d4">Vous avez oublié votre panier 🛒</h2>
      <p>Bonjour,<br>il semble que vous n'ayez pas finalisé votre commande sur lebonchiffre. Pas d'inquiétude, vos articles vous attendent toujours.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr style="background:#f1f5f9"><th style="text-align:left;padding:8px">Article</th><th style="padding:8px">Qté</th><th style="padding:8px;text-align:right">Prix</th></tr>
        ${rows}
      </table>
      <p style="font-size:18px"><b>Total : ${total}€</b></p>
      <p>Pour finaliser votre achat en toute sécurité, revenez sur lebonchiffre et reprenez votre sélection. Paiement sécurisé · 3x sans frais disponibles.</p>
      <p style="color:#64748b;font-size:12px;margin-top:24px">lebonchiffre — relance automatique</p>
    </div>`;
  await base44.asServiceRole.integrations.Core.SendEmail({
    to: order.email,
    subject: "Vous avez oublié votre panier sur lebonchiffre 🛒",
    body
  });
  return { sent: true };
}

export async function sendSupplierDispatchEmail(base44, order, supplierEmail) {
  if (!supplierEmail) return { sent: false, reason: "no_supplier_email" };
  if (!order || !Array.isArray(order.items) || order.items.length === 0) return { sent: false, reason: "no_items" };
  const rows = (order.items || [])
    .map(i => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${i.price}€</td></tr>`)
    .join("");
  const body = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:auto;color:#0f172a">
      <h2 style="color:#06b6d4">📦 Nouvelle commande à expédier</h2>
      <p>Une commande payée sur lebonchiffre doit être préparée et expédiée directement au client.</p>
      <p>
        <b>Référence commande :</b> #${shortId(order.id)}<br>
        <b>Client :</b> ${order.email || "n/a"}<br>
        <b>Total encaissé :</b> ${order.total}€
      </p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr style="background:#f1f5f9"><th style="text-align:left;padding:8px">Article</th><th style="padding:8px">Qté</th><th style="padding:8px;text-align:right">Prix unitaire</th></tr>
        ${rows}
      </table>
      <p style="color:#64748b;font-size:12px;margin-top:24px">Transmission automatique lebonchiffre — dropshipping. Merci d'expédier sous 24-48h et de communiquer le suivi.</p>
    </div>`;
  await base44.asServiceRole.integrations.Core.SendEmail({
    to: supplierEmail,
    subject: `📦 Commande #${shortId(order.id)} à expédier — lebonchiffre`,
    body
  });
  return { sent: true };
}

export async function sendRefundEmail(base44, order) {
  if (!order || !order.email) return { sent: false, reason: "no_email" };
  const rows = (order.items || [])
    .map(i => `${i.name} ×${i.quantity} (${i.price}€)`)
    .join(", ");
  const body = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;color:#0f172a">
      <h2 style="color:#06b6d4">Remboursement de votre commande</h2>
      <p>Bonjour,<br>votre commande <b>#${shortId(order.id)}</b> a été remboursée intégralement. Le montant de ${order.total}€ vous sera restitué sur votre moyen de paiement initial sous quelques jours ouvrés.</p>
      <p><b>Articles concernés :</b> ${rows}</p>
      <p style="color:#64748b;font-size:12px;margin-top:24px">lebonchiffre — remboursement automatique</p>
    </div>`;
  await base44.asServiceRole.integrations.Core.SendEmail({
    to: order.email,
    subject: `Remboursement de votre commande lebonchiffre #${shortId(order.id)}`,
    body
  });
  return { sent: true };
}

export async function sendLowStockEmail(base44, products, ownerEmail) {
  if (!ownerEmail) return { sent: false, reason: "no_owner_email" };
  if (!products || products.length === 0) return { sent: false, reason: "no_low_stock" };
  const rows = products.map(p => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${p.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${p.stock ?? 0}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${p.category || ""}</td></tr>`).join("");
  const body = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;color:#0f172a">
      <h2 style="color:#f59e0b">⚠️ Alerte stock bas</h2>
      <p>Les produits suivants ont un stock faible (≤ 5 unités) sur lebonchiffre. Pensez à réapprovisionner.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr style="background:#f1f5f9"><th style="text-align:left;padding:8px">Produit</th><th style="padding:8px">Stock</th><th style="padding:8px;text-align:right">Univers</th></tr>
        ${rows}
      </table>
      <p style="color:#64748b;font-size:12px;margin-top:24px">lebonchiffre — alerte automatique</p>
    </div>`;
  await base44.asServiceRole.integrations.Core.SendEmail({
    to: ownerEmail,
    subject: `⚠️ Alerte stock bas — ${products.length} produit(s)`,
    body
  });
  return { sent: true };
}