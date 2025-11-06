import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Monitor, Smartphone, Globe, MapPin, Clock } from "lucide-react";

export const ClickTrackingDashboard = () => {
  const { data: trackingData, isLoading } = useQuery({
    queryKey: ["click-tracking"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("click_tracking")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["click-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("click_tracking")
        .select("device_type, country_code, clicked_item_type");
      if (error) throw error;
      
      const totalClicks = data.length;
      const mobileClicks = data.filter(d => d.device_type === 'mobile').length;
      const desktopClicks = data.filter(d => d.device_type === 'desktop').length;
      const uniqueCountries = new Set(data.map(d => d.country_code)).size;
      const categoryClicks = data.filter(d => d.clicked_item_type === 'category').length;
      const webResultClicks = data.filter(d => d.clicked_item_type === 'web_result').length;

      return {
        totalClicks,
        mobileClicks,
        desktopClicks,
        uniqueCountries,
        categoryClicks,
        webResultClicks,
      };
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading tracking data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex flex-col items-center text-center">
            <Clock className="w-6 h-6 text-primary mb-2" />
            <div className="text-2xl font-bold">{stats?.totalClicks || 0}</div>
            <div className="text-xs text-muted-foreground">Total Clicks</div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex flex-col items-center text-center">
            <Smartphone className="w-6 h-6 text-primary mb-2" />
            <div className="text-2xl font-bold">{stats?.mobileClicks || 0}</div>
            <div className="text-xs text-muted-foreground">Mobile</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex flex-col items-center text-center">
            <Monitor className="w-6 h-6 text-primary mb-2" />
            <div className="text-2xl font-bold">{stats?.desktopClicks || 0}</div>
            <div className="text-xs text-muted-foreground">Desktop</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex flex-col items-center text-center">
            <Globe className="w-6 h-6 text-primary mb-2" />
            <div className="text-2xl font-bold">{stats?.uniqueCountries || 0}</div>
            <div className="text-xs text-muted-foreground">Countries</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex flex-col items-center text-center">
            <MapPin className="w-6 h-6 text-primary mb-2" />
            <div className="text-2xl font-bold">{stats?.categoryClicks || 0}</div>
            <div className="text-xs text-muted-foreground">Category Clicks</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex flex-col items-center text-center">
            <MapPin className="w-6 h-6 text-primary mb-2" />
            <div className="text-2xl font-bold">{stats?.webResultClicks || 0}</div>
            <div className="text-xs text-muted-foreground">Result Clicks</div>
          </div>
        </Card>
      </div>

      {/* Tracking Table */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Clicks</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Session ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trackingData?.map((track) => (
                  <TableRow key={track.id}>
                    <TableCell className="text-xs">
                      {format(new Date(track.timestamp), 'MMM dd, HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={track.clicked_item_type === 'category' ? 'secondary' : 'default'}>
                        {track.clicked_item_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {track.device_type === 'mobile' ? (
                          <Smartphone className="w-4 h-4" />
                        ) : (
                          <Monitor className="w-4 h-4" />
                        )}
                        <span className="text-xs">{track.device_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{track.country_code}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{track.city}</TableCell>
                    <TableCell className="text-xs font-mono">{track.ip_address}</TableCell>
                    <TableCell className="text-xs font-mono">
                      {track.session_id?.substring(0, 8)}...
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
};
