import { supabase } from "@/integrations/supabase/client";

// Generate a session ID for tracking
export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

// Detect traffic source
export const detectSource = (): string => {
  const referrer = document.referrer.toLowerCase();
  
  if (!referrer || referrer === '') return 'direct';
  
  if (referrer.includes('facebook.com') || referrer.includes('fb.com')) return 'facebook';
  if (referrer.includes('instagram.com')) return 'instagram';
  if (referrer.includes('linkedin.com')) return 'linkedin';
  if (referrer.includes('twitter.com') || referrer.includes('x.com')) return 'twitter';
  if (referrer.includes('youtube.com')) return 'youtube';
  if (referrer.includes('google.com')) return 'google';
  if (referrer.includes('bing.com')) return 'bing';
  if (referrer.includes('yahoo.com')) return 'yahoo';
  
  // Check for UTM parameters
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source');
  if (utmSource) return utmSource;
  
  return 'referral';
};

// Track page view
export const trackPageView = async () => {
  try {
    const sessionId = getSessionId();
    const source = detectSource();
    const pageUrl = window.location.pathname;
    
    await supabase.from('page_views').insert({
      session_id: sessionId,
      page_url: pageUrl,
      referrer: document.referrer || 'direct',
      source: source,
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
};

// Track a click event
export const trackClick = async (
  clickedItemType: 'category' | 'web_result',
  clickedItemId: string
) => {
  try {
    const sessionId = getSessionId();
    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    const referrer = document.referrer || 'direct';
    const source = detectSource();
    const pageUrl = window.location.pathname;

    const { data, error } = await supabase.functions.invoke('track-click', {
      body: {
        clickedItemType,
        clickedItemId,
        sessionId,
        screenResolution,
        referrer,
        source,
        pageUrl,
      },
    });

    if (error) {
      console.error('Tracking error:', error);
    }

    return data;
  } catch (error) {
    console.error('Failed to track click:', error);
    return null;
  }
};
