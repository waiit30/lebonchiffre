import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Check, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useCart } from '@/lib/cartStore';

export default function CheckoutSuccess() {
  const { dispatch } = useCart();
  const [ref, setRef] = useState('');
  const [status, setStatus] = useState('loading'); // loading | paid | error
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const provider = params.get('provider');

    const run = async () => {
      try {
        if (provider === 'paypal') {
          const paypalOrderId = params.get('token');
          const orderId = params.get('order_id');
          if (!paypalOrderId || !orderId) {
            setStatus('error');
            setError('Paramètres de paiement PayPal manquants.');
            return;
          }
          const res = await base44.functions.invoke('capturePaypalOrder', {
            paypal_order_id: paypalOrderId,
            order_id: orderId
          });
          if (res.data?.ok || res.data?.status === 'paid') {
            setRef('#' + orderId.slice(-6).toUpperCase());
            setStatus('paid');
          } else {
            setStatus('error');
            setError(res.data?.error || 'Échec de la capture du paiement.');
          }
        } else {
          setRef((params.get('session_id') || '').slice(0, 20));
          setStatus('paid');
        }
      } catch (e) {
        setStatus('error');
        setError(e.message || 'Erreur lors de la confirmation.');
      } finally {
        dispatch({ type: 'CLEAR' });
      }
    };
    run();
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-10 w-10 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center md:py-32">
        <div className="flex h-20 w-20 items-center justify-center border border-destructive/40 bg-destructive/10">
          <Activity className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="mt-8 font-display text-3xl font-bold text-foreground">Confirmation échouée</h1>
        <p className="mt-4 max-w-md text-muted-foreground">{error}</p>
        <Link to="/panier" className="mt-8 border border-border px-6 py-3 text-sm font-semibold uppercase tracking-wider text-foreground">
          Retour au panier
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center md:py-32">
      <div className="flex h-20 w-20 items-center justify-center border border-cyan-400/40 bg-cyan-500/10 pulse-security">
        <Check className="h-10 w-10 text-cyan-400" />
      </div>
      <h1 className="mt-8 font-display text-3xl font-bold text-foreground md:text-4xl">Paiement sécurisé confirmé</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Votre transaction a été chiffrée et validée avec succès. Une confirmation vient d'être envoyée à votre adresse email.
      </p>

      <div className="mt-8 w-full max-w-sm border border-border bg-card p-5 text-left">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-400">
          <ShieldCheck className="h-3 w-3" /> Reçu de transaction
        </div>
        <div className="mt-3 flex justify-between text-sm text-muted-foreground">
          <span>Statut</span>
          <span className="text-cyan-400">Payé · Sécurisé</span>
        </div>
        {ref && (
          <div className="mt-2 flex justify-between text-sm text-muted-foreground">
            <span>Réf. transaction</span>
            <span className="font-mono text-xs text-foreground">{ref}</span>
          </div>
        )}
      </div>

      <Link to="/" className="mt-8 bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground">
        Retour à la galerie
      </Link>
    </div>
  );
}