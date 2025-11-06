import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Edit, Globe } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { countries } from "@/lib/countries";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export function WebResultsEditor() {
  const queryClient = useQueryClient();
  const [selectedWrPage, setSelectedWrPage] = useState("1");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states for new result
  const [newOfferName, setNewOfferName] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newLink, setNewLink] = useState("");
  const [newLogoUrl, setNewLogoUrl] = useState("");
  const [newSerialNumber, setNewSerialNumber] = useState("");
  const [newIsSponsored, setNewIsSponsored] = useState(false);
  const [newImportedFrom, setNewImportedFrom] = useState("");
  const [newIsWorldwide, setNewIsWorldwide] = useState(true);
  const [newAllowedCountries, setNewAllowedCountries] = useState<string[]>([]);
  const [newBacklinkUrl, setNewBacklinkUrl] = useState("");
  const [countryPopoverOpen, setCountryPopoverOpen] = useState(false);

  // Form states for editing
  const [editOfferName, setEditOfferName] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editLogoUrl, setEditLogoUrl] = useState("");
  const [editSerialNumber, setEditSerialNumber] = useState("");
  const [editIsSponsored, setEditIsSponsored] = useState(false);
  const [editImportedFrom, setEditImportedFrom] = useState("");
  const [editIsWorldwide, setEditIsWorldwide] = useState(true);
  const [editAllowedCountries, setEditAllowedCountries] = useState<string[]>([]);
  const [editBacklinkUrl, setEditBacklinkUrl] = useState("");
  const [editCountryPopoverOpen, setEditCountryPopoverOpen] = useState(false);

  const { data: webResults } = useQuery({
    queryKey: ["web-results-all", selectedWrPage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("web_results")
        .select("*")
        .eq("web_result_page", parseInt(selectedWrPage))
        .order("is_sponsored", { ascending: false })
        .order("serial_number", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { data: resultData, error: resultError } = await supabase
        .from("web_results")
        .insert({
          web_result_page: parseInt(selectedWrPage),
          offer_name: newOfferName,
          title: newTitle,
          description: newDescription,
          original_link: newLink,
          logo_url: newLogoUrl || null,
          serial_number: parseInt(newSerialNumber),
          is_sponsored: newIsSponsored,
          imported_from: newImportedFrom || null,
        })
        .select()
        .single();

      if (resultError) throw resultError;

      // Insert country permissions
      const { error: countryError } = await supabase
        .from("web_result_countries")
        .insert({
          web_result_id: resultData.id,
          is_worldwide: newIsWorldwide,
          allowed_countries: newAllowedCountries,
          backlink_url: newBacklinkUrl || null,
        });

      if (countryError) throw countryError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["web-results-all"] });
      toast.success("Web result added successfully");
      resetNewForm();
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add web result");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("web_results")
        .update({
          offer_name: editOfferName,
          title: editTitle,
          description: editDescription,
          original_link: editLink,
          logo_url: editLogoUrl || null,
          serial_number: parseInt(editSerialNumber),
          is_sponsored: editIsSponsored,
          imported_from: editImportedFrom || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["web-results-all"] });
      toast.success("Web result updated successfully");
      setEditingId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update web result");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("web_results").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["web-results-all"] });
      toast.success("Web result deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete web result");
    },
  });

  const resetNewForm = () => {
    setNewOfferName("");
    setNewTitle("");
    setNewDescription("");
    setNewLink("");
    setNewLogoUrl("");
    setNewSerialNumber("");
    setNewIsSponsored(false);
    setNewImportedFrom("");
    setNewIsWorldwide(true);
    setNewAllowedCountries([]);
    setNewBacklinkUrl("");
  };

  const startEdit = (result: any) => {
    setEditingId(result.id);
    setEditOfferName(result.offer_name);
    setEditTitle(result.title);
    setEditDescription(result.description);
    setEditLink(result.original_link);
    setEditLogoUrl(result.logo_url || "");
    setEditSerialNumber(result.serial_number.toString());
    setEditIsSponsored(result.is_sponsored);
    setEditImportedFrom(result.imported_from || "");
  };

  const sponsoredResults = webResults?.filter((r) => r.is_sponsored) || [];
  const regularResults = webResults?.filter((r) => !r.is_sponsored) || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Web Results Editor</h1>
        <div className="flex gap-4">
          <Select value={selectedWrPage} onValueChange={setSelectedWrPage}>
            <SelectTrigger className="w-32">
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Result
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Web Result for wr={selectedWrPage}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new-sponsored"
                    checked={newIsSponsored}
                    onCheckedChange={(checked) => setNewIsSponsored(!!checked)}
                  />
                  <Label htmlFor="new-sponsored">Sponsored Result</Label>
                </div>
                <div>
                  <Label>Offer Name</Label>
                  <Input
                    value={newOfferName}
                    onChange={(e) => setNewOfferName(e.target.value)}
                    placeholder="Company or offer name"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Short tagline"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Detailed description"
                    rows={3}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Original Link (URL)</Label>
                  <Input
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    placeholder="https://example.com"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Logo URL (Optional)</Label>
                  <Input
                    value={newLogoUrl}
                    onChange={(e) => setNewLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Serial Number (Position)</Label>
                  <Input
                    type="number"
                    value={newSerialNumber}
                    onChange={(e) => setNewSerialNumber(e.target.value)}
                    placeholder="1, 2, 3..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Imported From (Optional)</Label>
                  <Input
                    value={newImportedFrom}
                    onChange={(e) => setNewImportedFrom(e.target.value)}
                    placeholder="Source website name"
                    className="mt-2"
                  />
                </div>
                
                {/* Country Settings */}
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Globe className="w-4 h-4" />
                    <Label className="text-base font-semibold">Country Access Settings</Label>
                  </div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="new-worldwide"
                      checked={newIsWorldwide}
                      onCheckedChange={(checked) => {
                        setNewIsWorldwide(!!checked);
                        if (checked) setNewAllowedCountries([]);
                      }}
                    />
                    <Label htmlFor="new-worldwide">Allow Worldwide Access</Label>
                  </div>
                  {!newIsWorldwide && (
                    <>
                      <Label>Allowed Countries</Label>
                      <Popover open={countryPopoverOpen} onOpenChange={setCountryPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start mt-2">
                            {newAllowedCountries.length > 0
                              ? `${newAllowedCountries.length} countries selected`
                              : "Select countries"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput placeholder="Search countries..." />
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                              {countries.map((country) => (
                                <CommandItem
                                  key={country.code}
                                  onSelect={() => {
                                    setNewAllowedCountries(prev =>
                                      prev.includes(country.code)
                                        ? prev.filter(c => c !== country.code)
                                        : [...prev, country.code]
                                    );
                                  }}
                                >
                                  <Checkbox
                                    checked={newAllowedCountries.includes(country.code)}
                                    className="mr-2"
                                  />
                                  {country.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newAllowedCountries.map(code => (
                          <Badge key={code} variant="secondary">
                            {countries.find(c => c.code === code)?.name}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                  <div className="mt-4">
                    <Label>Backlink URL (for blocked countries)</Label>
                    <Input
                      value={newBacklinkUrl}
                      onChange={(e) => setNewBacklinkUrl(e.target.value)}
                      placeholder="https://alternative-site.com"
                      className="mt-2"
                    />
                  </div>
                </div>
                
                <Button
                  onClick={() => addMutation.mutate()}
                  disabled={
                    !newOfferName ||
                    !newTitle ||
                    !newDescription ||
                    !newLink ||
                    !newSerialNumber ||
                    addMutation.isPending
                  }
                  className="w-full"
                >
                  {addMutation.isPending ? "Adding..." : "Add Result"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="sponsored" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sponsored">
            Sponsored ({sponsoredResults.length})
          </TabsTrigger>
          <TabsTrigger value="regular">Regular ({regularResults.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="sponsored" className="space-y-4 mt-6">
          {sponsoredResults.map((result) => (
            <Card key={result.id}>
              <CardContent className="pt-6">
                {editingId === result.id ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-sponsored"
                        checked={editIsSponsored}
                        onCheckedChange={(checked) => setEditIsSponsored(!!checked)}
                      />
                      <Label htmlFor="edit-sponsored">Sponsored Result</Label>
                    </div>
                    <div>
                      <Label>Offer Name</Label>
                      <Input
                        value={editOfferName}
                        onChange={(e) => setEditOfferName(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={3}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Original Link</Label>
                      <Input
                        value={editLink}
                        onChange={(e) => setEditLink(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Logo URL</Label>
                      <Input
                        value={editLogoUrl}
                        onChange={(e) => setEditLogoUrl(e.target.value)}
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
                        <Label>Imported From</Label>
                        <Input
                          value={editImportedFrom}
                          onChange={(e) => setEditImportedFrom(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateMutation.mutate(result.id)}
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
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-2">
                        Position: {result.serial_number} | Page: wr={result.web_result_page}
                        {result.imported_from && ` | From: ${result.imported_from}`}
                      </div>
                      <div className="text-xl font-bold mb-1">{result.offer_name}</div>
                      <div className="text-sm text-primary mb-2">{result.title}</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {result.description}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {result.original_link}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => startEdit(result)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteMutation.mutate(result.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {sponsoredResults.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              No sponsored results for wr={selectedWrPage}
            </div>
          )}
        </TabsContent>
        <TabsContent value="regular" className="space-y-4 mt-6">
          {regularResults.map((result) => (
            <Card key={result.id}>
              <CardContent className="pt-6">
                {editingId === result.id ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-sponsored"
                        checked={editIsSponsored}
                        onCheckedChange={(checked) => setEditIsSponsored(!!checked)}
                      />
                      <Label htmlFor="edit-sponsored">Sponsored Result</Label>
                    </div>
                    <div>
                      <Label>Offer Name</Label>
                      <Input
                        value={editOfferName}
                        onChange={(e) => setEditOfferName(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={3}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Original Link</Label>
                      <Input
                        value={editLink}
                        onChange={(e) => setEditLink(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Logo URL</Label>
                      <Input
                        value={editLogoUrl}
                        onChange={(e) => setEditLogoUrl(e.target.value)}
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
                        <Label>Imported From</Label>
                        <Input
                          value={editImportedFrom}
                          onChange={(e) => setEditImportedFrom(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateMutation.mutate(result.id)}
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
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-2">
                        Position: {result.serial_number} | Page: wr={result.web_result_page}
                        {result.imported_from && ` | From: ${result.imported_from}`}
                      </div>
                      <div className="text-lg font-bold mb-1">{result.offer_name}</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {result.title}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {result.description}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {result.original_link}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => startEdit(result)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteMutation.mutate(result.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {regularResults.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              No regular results for wr={selectedWrPage}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}