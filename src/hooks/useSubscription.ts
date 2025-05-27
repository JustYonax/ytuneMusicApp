import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface Subscription {
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .maybeSingle();

        if (error) throw error;

        setSubscription(data);
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('stripe_user_subscriptions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stripe_subscriptions',
        },
        (payload) => {
          console.log('Subscription updated:', payload);
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    subscription,
    isLoading,
    error,
    isActive: subscription?.subscription_status === 'active',
  };
}