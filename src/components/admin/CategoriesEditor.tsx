import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Edit } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CategoriesEditor() {
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState("");
  const [newSerialNumber, setNewSerialNumber] = useState("");
  const [newWrPage, setNewWrPage] = useState("1");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSerialNumber, setEditSerialNumber] = useState("");
  const [editWrPage, setEditWrPage] = useState("1");
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("related_categories").insert({
        title: newTitle,
        serial_number: parseInt(newSerialNumber),
        web_result_page: parseInt(newWrPage),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["related-categories"] });
      toast.success("Category added successfully");
      setNewTitle("");
      setNewSerialNumber("");
      setNewWrPage("1");
      setDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to add category");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("related_categories")
        .update({
          title: editTitle,
          serial_number: parseInt(editSerialNumber),
          web_result_page: parseInt(editWrPage),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["related-categories"] });
      toast.success("Category updated successfully");
      setEditingId(null);
    },
    onError: () => {
      toast.error("Failed to update category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("related_categories")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["related-categories"] });
      toast.success("Category deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete category");
    },
  });

  const startEdit = (category: any) => {
    setEditingId(category.id);
    setEditTitle(category.title);
    setEditSerialNumber(category.serial_number.toString());
    setEditWrPage(category.web_result_page.toString());
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Categories Editor</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="new-title">Title</Label>
                <Input
                  id="new-title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Category title"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="new-serial">Serial Number (Position)</Label>
                <Input
                  id="new-serial"
                  type="number"
                  value={newSerialNumber}
                  onChange={(e) => setNewSerialNumber(e.target.value)}
                  placeholder="1, 2, 3..."
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="new-wr">Web Result Page (wr=)</Label>
                <Select value={newWrPage} onValueChange={setNewWrPage}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        wr={num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => addMutation.mutate()}
                disabled={!newTitle || !newSerialNumber || addMutation.isPending}
                className="w-full"
              >
                {addMutation.isPending ? "Adding..." : "Add Category"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {categories?.map((category) => (
          <Card key={category.id}>
            <CardContent className="pt-6">
              {editingId === category.id ? (
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Serial Number</Label>
                      <Input
                        type="number"
                        value={editSerialNumber}
                        onChange={(e) => setEditSerialNumber(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Web Result Page</Label>
                      <Select value={editWrPage} onValueChange={setEditWrPage}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              wr={num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateMutation.mutate(category.id)}
                      disabled={updateMutation.isPending}
                    >
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Position: {category.serial_number} | Redirects to: wr=
                      {category.web_result_page}
                    </div>
                    <div className="text-lg font-semibold">{category.title}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => startEdit(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteMutation.mutate(category.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}