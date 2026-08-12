import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets, waitUntil } from 'base44:runtime';
import { getPaypalAccessToken } from "../../shared/paypalAuth.ts";
import { sendOrderFollowupEmail, sendSaleNotificationEmail, sendSupplierDispatchEmail } from "../../shared/orderEmails.ts";
import { applySale } from "../../shared/salesSync.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { paypal_order_id, order_id } = body;

    if (!paypal_order_id || !order_id) {
      return Response.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const order = await base44.asServiceRole.entities.Order.get(order_id);
    if (!order) {
      return Response.json({ error: "Commande introuvable" }, { status: 404 });
    }
    if (order.status === "paid") {
      return Response.json({ ok: true, status: "paid", already: true, order_id });
    }

    const { accessToken, cfg } = await getPaypalAccessToken();

    const res = await fetch(`${cfg.baseUrl}/v2/checkout/orders/${paypal_order_id}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": crypto.randomUUID(),
      },
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("PayPal capture error:", err);
      await base44.asServiceRole.entities.Order.update(order_id, { status: "failed" });
      return Response.json({ error: "Capture échouée: " + err.slice(0, 200) }, { status: 400 });
    }

    const data = await res.json();
    const captured = (data.purchase_units || []).some(pu =>
      (pu.payments?.captures || []).some(c => c.status === "COMPLETED")
    );

    if (!captured) {
      await base44.asServiceRole.entities.Order.update(order_id, { status: "failed" });
      return Response.json({ error: "Paiement non capturé" }, { status: 400 });
    }

    await base44.asServiceRole.entities.Order.update(order_id, { status: "paid" });

    // Sync stock + ventes + classement, puis e-mails de suivi client + notification propriétaire
    const updated = await base44.asServiceRole.entities.Order.get(order_id);
    const ownerEmail = secrets.get("OWNER_EMAIL");
    const supplierEmail = secrets.get("SUPPLIER_EMAIL");
    waitUntil((async () => {
      try { await applySale(base44, updated); } catch (e) { console.error("sync ventes:", e.message); }
      try { await sendOrderFollowupEmail(base44, updated); } catch (e) { console.error("followup email:", e.message); }
      try { await sendSaleNotificationEmail(base44, updated, ownerEmail); } catch (e) { console.error("sale email:", e.message); }
      try {
        await sendSupplierDispatchEmail(base44, updated, supplierEmail);
        await base44.asServiceRole.entities.Order.update(order_id, { supplier_dispatched: true });
      } catch (e) { console.error("supplier dispatch:", e.message); }
    })());

    return Response.json({ ok: true, status: "paid", order_id });
  } catch (error) {
    console.error("PayPal capture error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}