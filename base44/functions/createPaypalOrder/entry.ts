import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getPaypalAccessToken } from "../../shared/paypalAuth.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { items, email, plan } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ error: "Panier vide" }, { status: 400 });
    }

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    if (total <= 0) {
      return Response.json({ error: "Montant invalide" }, { status: 400 });
    }

    // Enregistre la commande en base (pending)
    const order = await base44.asServiceRole.entities.Order.create({
      items: items.map(i => ({ product_id: i.id || i.product_id || "", name: i.name, price: i.price, quantity: i.quantity })),
      total,
      email: email || "",
      status: "pending"
    });

    const origin = req.headers.get("origin") || "https://lebonchiffre.base44.app";
    const returnUrl = `${origin}/checkout/success?provider=paypal&order_id=${order.id}`;
    const cancelUrl = `${origin}/panier`;

    const { accessToken, cfg } = await getPaypalAccessToken();

    const payload = {
      intent: "CAPTURE",
      purchase_units: [{
        amount: { currency_code: "EUR", value: total.toFixed(2) },
        description: `Commande lebonchiffre #${order.id.slice(-6).toUpperCase()}`,
        custom_id: order.id,
      }],
      application_context: {
        brand_name: "lebonchiffre",
        return_url: returnUrl,
        cancel_url: cancelUrl,
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
      },
    };

    const res = await fetch(`${cfg.baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": crypto.randomUUID(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("PayPal create order error:", err);
      await base44.asServiceRole.entities.Order.update(order.id, { status: "failed" });
      return Response.json({ error: "Erreur PayPal: " + err.slice(0, 200) }, { status: 400 });
    }

    const data = await res.json();
    const approveLink = (data.links || []).find(l => l.rel === "approve" || l.rel === "payer-action");
    if (!approveLink) {
      await base44.asServiceRole.entities.Order.update(order.id, { status: "failed" });
      return Response.json({ error: "Lien d'approbation PayPal introuvable" }, { status: 500 });
    }

    await base44.asServiceRole.entities.Order.update(order.id, { stripe_session_id: data.id });

    return Response.json({
      approval_url: approveLink.href,
      paypal_order_id: data.id,
      order_id: order.id
    });
  } catch (error) {
    console.error("PayPal create error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}