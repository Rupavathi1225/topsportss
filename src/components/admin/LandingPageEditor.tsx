import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LandingPageEditor() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

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

  useEffect(() => {
    if (landingPage) {
      setTitle(landingPage.title);
      setDescription(landingPage.description);
    }
  }, [landingPage]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("landing_page")
        .update({ title, description })
        .eq("id", landingPage?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-page"] });
      toast.success("Landing page updated successfully");
    },
    onError: () => {
      toast.error("Failed to update landing page");
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Landing Page Editor</h1>
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Main title"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description text"
              rows={5}
              className="mt-2"
            />
          </div>
          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}