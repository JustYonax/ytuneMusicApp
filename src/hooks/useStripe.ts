import { useState } from 'react';
import { useAuth } from './useAuth';
import { products } from '../stripe-config';

export function useStripe() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (priceId: string, mode: 'payment' | 'subscription') => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/cancel`,
          mode,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const subscribe = async (productId: keyof typeof products) => {
    const product = products[productId];
    if (!product) {
      throw new Error('Invalid product');
    }

    await createCheckoutSession(product.priceId, product.mode);
  };

  return {
    isLoading,
    error,
    subscribe,
  };
}