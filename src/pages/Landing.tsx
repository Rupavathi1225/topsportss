import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { trackClick, trackPageView } from "@/lib/tracking";
import { useEffect } from "react";

const Landing = () => {
  useEffect(() => {
    trackPageView();
  }, []);

  const { data: landingPage } = useQuery({
    queryKey: ["landing-page"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_page")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["related-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("related_categories")
        .select("*")
        .order("serial_number", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/landing" className="text-2xl font-bold text-primary">
            Topsports
          </Link>
          <Search className="w-6 h-6 text-muted-foreground" />
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            {landingPage?.title || "Loading..."}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {landingPage?.description || "Loading..."}
          </p>
        </div>

        {/* Related Categories */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground text-center mb-8">
            RELATED CATEGORIES
          </h2>
          <div className="space-y-3">
            {categories?.map((category) => (
              <Link
                key={category.id}
                to={`/wr${category.web_result_page}`}
                className="block"
                onClick={() => trackClick('category', category.id)}
              >
                <Button
                  variant="secondary"
                  className="w-full justify-between h-auto py-5 px-6 text-left hover:bg-secondary/80 transition-all duration-300 group"
                >
                  <span className="text-base font-normal">{category.title}</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;