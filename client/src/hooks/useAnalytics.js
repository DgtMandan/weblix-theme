import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api.js';

function getDevice() {
  if (window.innerWidth < 640) return 'mobile';
  if (window.innerWidth < 1024) return 'tablet';
  return 'desktop';
}

export function trackEvent(type, metadata = {}) {
  api.post('/analytics/track', {
    type,
    path: window.location.pathname,
    title: document.title,
    referrer: document.referrer,
    device: getDevice(),
    metadata
  }).catch(() => {});
}

export function usePageAnalytics() {
  const location = useLocation();
  useEffect(() => {
    trackEvent('page_view', { search: location.search });
  }, [location.pathname, location.search]);
}
