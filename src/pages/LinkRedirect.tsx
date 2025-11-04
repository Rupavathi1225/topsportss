import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const LinkRedirect = () => {
  const { id } = useParams();

  useEffect(() => {
    const redirect = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("link_redirects")
        .select("original_url")
        .eq("id", parseInt(id))
        .single();

      if (error || !data) {
        window.location.href = "/landing";
        return;
      }

      window.location.href = data.original_url;
    };

    redirect();
  }, [id]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

export default LinkRedirect;