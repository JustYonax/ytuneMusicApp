import React from 'react';
import { Crown } from 'lucide-react';
import { useStripe } from '../hooks/useStripe';
import { useSubscription } from '../hooks/useSubscription';
import { products } from '../stripe-config';

interface SubscriptionButtonProps {
  onAuthRequired: () => void;
}

const SubscriptionButton: React.FC<SubscriptionButtonProps> = ({ onAuthRequired }) => {
  const { subscribe, isLoading } = useStripe();
  const { subscription, isActive } = useSubscription();

  const handleSubscribe = async () => {
    try {
      await subscribe('ytune');
    } catch (err) {
      if (err instanceof Error && err.message === 'User must be logged in') {
        onAuthRequired();
      }
    }
  };

  if (isActive) {
    return (
      <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full">
        <Crown size={18} />
        <span className="text-sm font-medium">Premium</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={isLoading}
      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full hover:from-purple-700 hover:to-indigo-700 transition-colors disabled:opacity-50"
    >
      <Crown size={18} />
      <span className="text-sm font-medium">
        {isLoading ? 'Processing...' : `Subscribe $${(Number(products.ytune.priceId.split('_')[2]) / 100).toFixed(2)}/mo`}
      </span>
    </button>
  );
};

export default SubscriptionButton;