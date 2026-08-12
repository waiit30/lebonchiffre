import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendOrderFollowupEmail } from '../../shared/orderEmails.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { orderId } = body;
    if (!orderId) return Response.json({ error: "orderId manquant" }, { status: 400 });

    const order = await base44.asServiceRole.entities.Order.get(orderId);
    const result = await sendOrderFollowupEmail(base44, order);
    return Response.json(result);
  } catch (error) {
    console.error("sendOrderFollowup error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}