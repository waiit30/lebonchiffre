import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';
import { sendLowStockEmail } from "../../shared/orderEmails.ts";

const THRESHOLD = 5;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const all = await base44.asServiceRole.entities.Product.list("-units_sold", 200);
    const low = all.filter(p => (p.stock ?? 0) <= THRESHOLD);

    const ownerEmail = secrets.get("OWNER_EMAIL");
    let sent = false;
    if (low.length && ownerEmail) {
      await sendLowStockEmail(base44, low, ownerEmail);
      sent = true;
    }

    return Response.json({
      threshold: THRESHOLD,
      lowStockCount: low.length,
      notified: sent,
      products: low.map(p => ({ name: p.name, stock: p.stock, category: p.category }))
    });
  } catch (error) {
    console.error("alertLowStock error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}