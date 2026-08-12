import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets, waitUntil } from 'base44:runtime';
import { getPaypalAccessToken } from "../../shared/paypalAuth.ts";
import { sendOrderFollowupEmail, sendSaleNotificationEmail, sendSupplierDispatchEmail, sendRefundEmail } from "../../shared/orderEmails.ts";
import { applySale, refundSale } from "../../shared/salesSync.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const webhookId = secrets.get("PAYPAL_WEBHOOK_ID");
    const rawBody = await req.text();

    if (!webhookId) {
      return Response.json({ error: "PAYPAL_WEBHOOK_ID non configuré" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // Vérification de signature via l'API PayPal
    const { accessToken, cfg } = await getPaypalAccessToken();
    const verifyRes = await fetch(`${cfg.baseUrl}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        transmission_id: req.headers.get("paypal-transmission-id"),
        transmission_time: req.headers.get("paypal-transmission-time"),
        cert_url: req.headers.get("paypal-cert-url"),
        auth_algo: req.headers.get("paypal-auth-algo"),
        transmission_sig: req.headers.get("paypal-transmission-sig"),
        webhook_id: webhookId,
        webhook_event: event
      })
    });
    const verifyData = await verifyRes.json();
    if (verifyData.verification_status !== "SUCCESS") {
      return Response.json({ error: "Signature PayPal invalide" }, { status: 401 });
    }

    const type = event.event_type;

    if (type === "CHECKOUT.ORDER.APPROVED") {
      // Le client a approuvé sur PayPal mais n'est pas revenu sur le site → on capture
      const paypalOrderId = event.resource?.id;
      const orderId = event.resource?.purchase_units?.[0]?.custom_id || event.resource?.custom_id;
      if (orderId && paypalOrderId) {
        await base44.functions.invoke("capturePaypalOrder", { paypal_order_id: paypalOrderId, order_id: orderId });
      }
    } else if (type === "PAYMENT.CAPTURE.COMPLETED") {
      // Capture déjà effectuée (par le retour client ou l'événement APPROVED) → on s'assure juste du statut
      const paypalOrderId = event.resource?.supplementary_data?.related_ids?.order_id;
      if (paypalOrderId) {
        const matches = await base44.asServiceRole.entities.Order.filter({ stripe_session_id: paypalOrderId }, "created_date", 5);
        const order = matches[0];
        if (order && order.status !== "paid") {
          await base44.asServiceRole.entities.Order.update(order.id, { status: "paid" });
          const updated = await base44.asServiceRole.entities.Order.get(order.id);
          const ownerEmail = secrets.get("OWNER_EMAIL");
          const supplierEmail = secrets.get("SUPPLIER_EMAIL");
          waitUntil((async () => {
            try { await applySale(base44, updated); } catch (e) { console.error("sync ventes:", e.message); }
            try { await sendOrderFollowupEmail(base44, updated); } catch (e) { console.error("followup:", e.message); }
            try { await sendSaleNotificationEmail(base44, updated, ownerEmail); } catch (e) { console.error("notif:", e.message); }
            try {
              await sendSupplierDispatchEmail(base44, updated, supplierEmail);
              await base44.asServiceRole.entities.Order.update(order.id, { supplier_dispatched: true });
            } catch (e) { console.error("supplier dispatch:", e.message); }
          })());
        }
      }
    } else if (type === "PAYMENT.CAPTURE.REFUNDED") {
      const paypalOrderId = event.resource?.supplementary_data?.related_ids?.order_id;
      if (paypalOrderId) {
        const matches = await base44.asServiceRole.entities.Order.filter({ stripe_session_id: paypalOrderId }, "created_date", 5);
        const order = matches[0];
        if (order && order.status !== "refunded") {
          const previousStatus = order.status;
          await base44.asServiceRole.entities.Order.update(order.id, { status: "refunded" });
          if (previousStatus === "paid") {
            waitUntil(refundSale(base44, order).catch(e => console.error("restockage:", e.message)));
          }
          waitUntil(sendRefundEmail(base44, order).catch(e => console.error("email remboursement:", e.message)));
        }
      }
    }

    return Response.json({ received: true, type });
  } catch (error) {
    console.error("paypalWebhook error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}