import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      clickedItemType,
      clickedItemId,
      sessionId,
      screenResolution,
      referrer,
      source = 'direct',
      pageUrl = '/'
    } = await req.json();

    // Get IP and location info
    const cfData = req.headers.get('cf-connecting-ip') || 
                   req.headers.get('x-forwarded-for')?.split(',')[0] || 
                   'unknown';
    
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const countryCode = req.headers.get('cf-ipcountry') || 'unknown';
    const city = req.headers.get('cf-ipcity') || 'unknown';
    
    // Detect device type
    const deviceType = /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
      ? 'mobile'
      : 'desktop';

    // Insert tracking data
    const { error: trackingError } = await supabase
      .from('click_tracking')
      .insert({
        clicked_item_type: clickedItemType,
        clicked_item_id: clickedItemId,
        ip_address: cfData,
        user_agent: userAgent,
        device_type: deviceType,
        session_id: sessionId,
        country_code: countryCode,
        city: city,
        referrer: referrer,
        screen_resolution: screenResolution,
        source: source,
        page_url: pageUrl,
      });

    if (trackingError) {
      console.error('Tracking error:', trackingError);
    }

    // If it's a web result click, check country permissions
    if (clickedItemType === 'web_result') {
      const { data: countryData } = await supabase
        .from('web_result_countries')
        .select('*')
        .eq('web_result_id', clickedItemId)
        .maybeSingle();

      if (countryData) {
        const isWorldwide = countryData.is_worldwide;
        const allowedCountries = countryData.allowed_countries || [];
        const isCountryAllowed = isWorldwide || allowedCountries.includes(countryCode);

        return new Response(
          JSON.stringify({
            success: true,
            allowed: isCountryAllowed,
            backlink: !isCountryAllowed ? countryData.backlink_url : null,
            countryCode,
            deviceType,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        allowed: true,
        countryCode,
        deviceType,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in track-click function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
