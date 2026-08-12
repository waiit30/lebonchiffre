import { secrets } from "base44:runtime";

export function paypalConfig() {
  const mode = (secrets.get("PAYPAL_MODE") || "sandbox").toLowerCase();
  const live = mode === "live";
  return {
    live,
    baseUrl: live ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com",
    clientId: secrets.get("PAYPAL_CLIENT_ID"),
    clientSecret: secrets.get("PAYPAL_CLIENT_SECRET"),
  };
}

export async function getPaypalAccessToken() {
  const cfg = paypalConfig();
  if (!cfg.clientId || !cfg.clientSecret) {
    throw new Error("Identifiants PayPal manquants (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET à renseigner dans Settings > Secrets).");
  }
  const auth = btoa(`${cfg.clientId}:${cfg.clientSecret}`);
  const res = await fetch(`${cfg.baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`PayPal auth échouée: ${txt.slice(0, 200)}`);
  }
  const data = await res.json();
  return { accessToken: data.access_token, cfg };
}