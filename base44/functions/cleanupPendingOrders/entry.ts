import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendAbandonedCartEmail } from "../../shared/orderEmails.ts";

const RELANCE_HOURS = 24;
const FAIL_HOURS = 72;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const now = Date.now();
    let relances = 0, failed = 0, scanned = 0;

    const orders = await base44.asServiceRole.entities.Order.filter({ status: "pending" }, "created_date", 200);
    for (const order of orders) {
      scanned++;
      const created = new Date(order.created_date).getTime();
      if (isNaN(created)) continue;
      const ageHours = (now - created) / 3600000;

      if (ageHours >= FAIL_HOURS) {
        await base44.asServiceRole.entities.Order.update(order.id, { status: "failed" });
        failed++;
      } else if (ageHours >= RELANCE_HOURS && !order.relance_sent) {
        try {
          await sendAbandonedCartEmail(base44, order);
          await base44.asServiceRole.entities.Order.update(order.id, { relance_sent: true });
          relances++;
        } catch (e) {
          console.error("relance email:", e.message);
        }
      }
    }

    return Response.json({ scanned, relances, failed });
  } catch (error) {
    console.error("cleanupPendingOrders error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}