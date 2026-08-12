import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets, waitUntil } from 'base44:runtime';
import { sendOrderFollowupEmail, sendSaleNotificationEmail, sendSupplierDispatchEmail, sendRefundEmail } from '../../shared/orderEmails.ts';
import { applySale, refundSale } from '../../shared/salesSync.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const sig = req.headers.get("stripe-signature");
    const secret = secrets.get("STRIPE_WEBHOOK_SECRET");
    const rawBody = await req.text();

    if (!sig || !secret) {
      return Response.json({ error: "Signature ou secret manquant" }, { status: 400 });
    }

    // Validation signature Stripe (SubtleCrypto async)
    const [tPart, v1Part] = sig.split(",").map(s => s.trim());
    const timestamp = tPart.split("=")[1];
    const v1 = v1Part.split("=")[1];
    const signedPayload = `${timestamp}.${rawBody}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
    const expectedSig = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, "0")).join("");

    if (expectedSig !== v1) {
      return Response.json({ error: "Signature invalide" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      if (orderId) {
        const existing = await base44.asServiceRole.entities.Order.get(orderId);
        await base44.asServiceRole.entities.Order.update(orderId, {
          status: "paid",
          stripe_session_id: session.id,
          email: session.customer_email || ""
        });
        const order = await base44.asServiceRole.entities.Order.get(orderId);
        const ownerEmail = secrets.get("OWNER_EMAIL");
        const supplierEmail = secrets.get("SUPPLIER_EMAIL");
        // Sync stock + ventes + classement (une seule fois, à la transition vers "paid")
        if (existing && existing.status !== "paid") {
          waitUntil(applySale(base44, order).catch(e => console.error("Sync ventes:", e.message)));
        }
        // Transmission automatique au fournisseur (dropshipping) — une seule fois
        if (existing && !existing.supplier_dispatched) {
          waitUntil((async () => {
            try { await sendSupplierDispatchEmail(base44, order, supplierEmail); } catch (e) { console.error("Envoi fournisseur:", e.message); }
            try { await base44.asServiceRole.entities.Order.update(orderId, { supplier_dispatched: true }); } catch (e) { console.error("Maj dispatched:", e.message); }
          })());
        }
        waitUntil(sendOrderFollowupEmail(base44, order).catch(e => console.error("Suivi commande:", e.message)));
        waitUntil(sendSaleNotificationEmail(base44, order, ownerEmail).catch(e => console.error("Notif vente:", e.message)));
      }
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object;
      // L'identifiant commande est stocké dans les métadonnées du paiement
      const orderId = charge.metadata?.order_id || charge.invoice?.metadata?.order_id;
      let order = null;
      try {
        if (orderId) {
          order = await base44.asServiceRole.entities.Order.get(orderId);
        } else {
          const matches = await base44.asServiceRole.entities.Order.filter(
            { stripe_session_id: charge.payment_intent || charge.id },
            "-created_date", 5
          );
          order = matches[0];
        }
      } catch (e) {
        console.error("Recherche commande remboursée:", e.message);
      }
      if (order && order.status !== "refunded") {
        const previousStatus = order.status;
        await base44.asServiceRole.entities.Order.update(order.id, { status: "refunded" });
        // Restockage uniquement si la commande était payée
        if (previousStatus === "paid") {
          waitUntil(refundSale(base44, order).catch(e => console.error("Restockage remboursement:", e.message)));
        }
        waitUntil(sendRefundEmail(base44, order).catch(e => console.error("Email remboursement:", e.message)));
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}