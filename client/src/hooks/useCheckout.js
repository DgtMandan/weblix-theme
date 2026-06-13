import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useState } from 'react';
import { trackEvent } from './useAnalytics.js';

export function useCheckout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function buy(itemType, itemId) {
    if (!user) return navigate('/login');
    setLoading(true);
    try {
      const { data } = await api.post('/orders', { itemType, itemId, provider: 'auto' });
      trackEvent('checkout_start', { itemType, itemId, orderId: data.order?._id, amount: data.order?.amount });
      navigate(`/checkout/${data.order._id}`, { state: data });
    } finally {
      setLoading(false);
    }
  }

  return { buy, loading };
}
