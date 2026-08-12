import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { items, email, plan } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ error: "Panier vide" }, { status: 400 });
    }

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Enregistre la commande en base (service role car le paiement est système)
    const order = await base44.asServiceRole.entities.Order.create({
      items: items.map(i => ({ product_id: i.id || i.product_id || "", name: i.name, price: i.price, quantity: i.quantity })),
      total,
      email: email || "",
      status: "pending"
    });

    const stripeKey = secrets.get("STRIPE_SECRET_KEY");
    const lineItems = items.map((item, idx) => ({
      [`line_items[${idx}][quantity]`]: String(item.quantity),
      [`line_items[${idx}][price_data][currency]`]: "eur",
      [`line_items[${idx}][price_data][unit_amount]`]: String(Math.round(item.price * 100)),
      [`line_items[${idx}][price_data][product_data][name]`]: item.name,
      [`line_items[${idx}][price_data][product_data][images][0]`]: item.image_url || ""
    }));

    const params = new URLSearchParams();
    params.append("mode", "payment");
    // 'card' active automatiquement Apple Pay / Google Pay via Stripe Checkout
    params.append("payment_method_types[]", "card");
    params.append("success_url", `${req.headers.get("origin") || "https://secure-vault-select.base44.app"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`);
    params.append("cancel_url", `${req.headers.get("origin") || "https://secure-vault-select.base44.app"}/cart`);
    params.append("customer_email", email || "");
    params.append("metadata[base44_app_id]", Deno.env.get("BASE44_APP_ID") || "");
    params.append("metadata[order_id]", order.id);
    params.append("metadata[plan]", plan || "full");
    for (const li of lineItems) {
      for (const [k, v] of Object.entries(li)) params.append(k, v);
    }

    const idemKey = crypto.randomUUID();
    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Stripe-Version": "2025-10-29.clover",
        "Idempotency-Key": idemKey
      },
      body: params
    });

    if (!stripeRes.ok) {
      const err = await stripeRes.json();
      await base44.asServiceRole.entities.Order.update(order.id, { status: "failed" });
      return Response.json({ error: err.error?.message || "Erreur Stripe" }, { status: 400 });
    }

    const session = await stripeRes.json();
    await base44.asServiceRole.entities.Order.update(order.id, { stripe_session_id: session.id });

    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    console.error("Checkout error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}