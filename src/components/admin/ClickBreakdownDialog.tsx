import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ClickDetail {
  id: string;
  timestamp: string;
  clicked_item_id: string;
  clicked_item_type: string;
  page_url: string;
  item_title?: string;
}

interface ClickBreakdownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  clickType: 'category' | 'web_result';
  clicks: ClickDetail[];
}

export const ClickBreakdownDialog = ({
  open,
  onOpenChange,
  sessionId,
  clickType,
  clicks,
}: ClickBreakdownDialogProps) => {
  const uniqueClicks = new Set(clicks.map(c => c.clicked_item_id)).size;
  
  // Fetch titles for clicked items
  const { data: itemTitles } = useQuery({
    queryKey: ["item-titles", clickType, clicks.map(c => c.clicked_item_id)],
    queryFn: async () => {
      if (clicks.length === 0) return {};
      
      const itemIds = [...new Set(clicks.map(c => c.clicked_item_id))];
      const tableName = clickType === 'category' ? 'related_categories' : 'web_results';
      const titleField = clickType === 'category' ? 'title' : 'offer_name';
      
      const { data, error } = await supabase
        .from(tableName)
        .select(`id, ${titleField}`)
        .in('id', itemIds);
      
      if (error) throw error;
      
      const titleMap: Record<string, string> = {};
      data?.forEach((item: any) => {
        titleMap[item.id] = item[titleField];
      });
      
      return titleMap;
    },
    enabled: open && clicks.length > 0,
  });
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {clickType === 'category' ? 'Related Searches' : 'Blog Clicks'} Breakdown
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            Session: {sessionId.substring(0, 8)}... | Total: {clicks.length} | Unique: {uniqueClicks}
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Item Clicked</TableHead>
                <TableHead>Page</TableHead>
                <TableHead>Item ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clicks.map((click) => (
                <TableRow key={click.id}>
                  <TableCell className="text-xs">
                    {format(new Date(click.timestamp), 'HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">
                        {itemTitles?.[click.clicked_item_id] || 'Loading...'}
                      </span>
                      <Badge variant="outline" className="w-fit">
                        {clickType === 'category' ? 'Category' : 'Web Result'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{click.page_url}</TableCell>
                  <TableCell className="text-xs font-mono">
                    {click.clicked_item_id.substring(0, 8)}...
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};
