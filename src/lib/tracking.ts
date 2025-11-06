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

// Track a click event
export const trackClick = async (
  clickedItemType: 'category' | 'web_result',
  clickedItemId: string
) => {
  try {
    const sessionId = getSessionId();
    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    const referrer = document.referrer || 'direct';

    const { data, error } = await supabase.functions.invoke('track-click', {
      body: {
        clickedItemType,
        clickedItemId,
        sessionId,
        screenResolution,
        referrer,
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
