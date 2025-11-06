import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocation, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { trackClick } from "@/lib/tracking";

const WebResults = () => {
  const location = useLocation();
  const pageMatch = location.pathname.match(/\/wr(\d+)/);
  const wrPage = pageMatch ? parseInt(pageMatch[1]) : 1;

  const { data: sponsoredResults } = useQuery({
    queryKey: ["web-results-sponsored", wrPage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("web_results")
        .select("*")
        .eq("web_result_page", wrPage)
        .eq("is_sponsored", true)
        .order("serial_number", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: webResults } = useQuery({
    queryKey: ["web-results", wrPage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("web_results")
        .select("*")
        .eq("web_result_page", wrPage)
        .eq("is_sponsored", false)
        .order("serial_number", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const createMaskedLink = async (originalUrl: string, resultId: string) => {
    // Track the click
    const trackingData = await trackClick('web_result', resultId);
    
    // Check if country is allowed
    if (trackingData && !trackingData.allowed && trackingData.backlink) {
      window.open(trackingData.backlink, '_blank', 'noopener,noreferrer');
      return;
    }

    // Check if link already exists in redirects
    const { data: existing } = await supabase
      .from("link_redirects")
      .select("id")
      .eq("original_url", originalUrl)
      .maybeSingle();

    if (existing) {
      window.open(`/lid=${existing.id}`, '_blank', 'noopener,noreferrer');
      return;
    }

    // Create new redirect
    const { data, error } = await supabase
      .from("link_redirects")
      .insert({ original_url: originalUrl })
      .select()
      .single();

    if (error) {
      console.error("Error creating redirect:", error);
      window.open(originalUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    window.open(`/lid=${data.id}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/30">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/landing">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/landing" className="text-2xl font-bold text-primary">
            Topsports
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Sponsored Results */}
        {sponsoredResults && sponsoredResults.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-6">Sponsored Results</h2>
            <div className="space-y-8">
              {sponsoredResults.map((result) => (
                <div
                  key={result.id}
                  className="bg-card border border-primary/50 rounded-lg p-6 hover:shadow-glow transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12 border-2 border-primary/30">
                      <AvatarImage src={result.logo_url || ""} alt={result.offer_name} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {result.offer_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                          Ad
                        </span>
                        <span className="text-xs text-muted-foreground">Sponsored</span>
                      </div>
                      <a
                        href={result.original_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                        onClick={(e) => {
                          e.preventDefault();
                          createMaskedLink(result.original_link, result.id);
                        }}
                      >
                        <h3 className="text-xl font-semibold text-foreground mb-1">
                          {result.offer_name}
                        </h3>
                      </a>
                      <div className="text-sm text-primary mb-2">
                        {result.title}
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">
                        {result.description}
                      </p>
                      <div className="text-xs text-muted-foreground mb-3">
                        topsportswin.com/lid={result.id}
                      </div>
                      <a
                        href={result.original_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                      <Button variant="default" size="sm" className="gap-2"
                        onClick={(e) => {
                          e.preventDefault();
                          createMaskedLink(result.original_link, result.id);
                        }}
                      >
                          <ExternalLink className="w-4 h-4" />
                          Visit Website
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Web Results */}
        {webResults && webResults.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-6">Web Results</h2>
            <div className="space-y-6">
              {webResults.map((result) => (
                <div key={result.id} className="py-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={result.logo_url || ""} alt={result.offer_name} />
                      <AvatarFallback className="bg-primary/20 text-primary text-sm">
                        {result.offer_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <a
                        href={result.original_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                        onClick={(e) => {
                          e.preventDefault();
                          createMaskedLink(result.original_link, result.id);
                        }}
                      >
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {result.offer_name}
                        </h3>
                      </a>
                      <div className="text-sm text-muted-foreground mb-1">
                        {result.title}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {result.description}
                      </p>
                      <a
                        href={result.original_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                        onClick={(e) => {
                          e.preventDefault();
                          createMaskedLink(result.original_link, result.id);
                        }}
                      >
                        topsportswin.com/lid={result.id}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default WebResults;