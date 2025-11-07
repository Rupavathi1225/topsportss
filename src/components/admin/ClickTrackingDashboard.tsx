import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Monitor, Smartphone, Globe, MapPin, Clock, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionAnalytics {
  session_id: string;
  ip_address: string;
  country_code: string;
  source: string;
  device_type: string;
  page_views: number;
  total_clicks: number;
  category_clicks: number;
  web_result_clicks: number;
  last_active: string;
}

export const ClickTrackingDashboard = () => {
  const { data: sessionData, isLoading } = useQuery({
    queryKey: ["session-analytics"],
    queryFn: async () => {
      // Get aggregated session data
      const { data: clicks, error: clicksError } = await supabase
        .from("click_tracking")
        .select("*")
        .order("timestamp", { ascending: false });
      
      if (clicksError) throw clicksError;

      const { data: pageViews, error: pageViewsError } = await supabase
        .from("page_views")
        .select("*");
      
      if (pageViewsError) throw pageViewsError;

      // Aggregate by session
      const sessionMap = new Map<string, SessionAnalytics>();

      clicks?.forEach((click) => {
        const sessionId = click.session_id;
        if (!sessionMap.has(sessionId)) {
          sessionMap.set(sessionId, {
            session_id: sessionId,
            ip_address: click.ip_address,
            country_code: click.country_code,
            source: click.source || 'direct',
            device_type: click.device_type,
            page_views: 0,
            total_clicks: 0,
            category_clicks: 0,
            web_result_clicks: 0,
            last_active: click.timestamp,
          });
        }

        const session = sessionMap.get(sessionId)!;
        session.total_clicks++;
        if (click.clicked_item_type === 'category') {
          session.category_clicks++;
        } else if (click.clicked_item_type === 'web_result') {
          session.web_result_clicks++;
        }
        
        // Update last active if this click is more recent
        if (new Date(click.timestamp) > new Date(session.last_active)) {
          session.last_active = click.timestamp;
        }
      });

      // Add page views count
      pageViews?.forEach((pv) => {
        if (sessionMap.has(pv.session_id)) {
          sessionMap.get(pv.session_id)!.page_views++;
        }
      });

      return Array.from(sessionMap.values()).sort((a, b) => 
        new Date(b.last_active).getTime() - new Date(a.last_active).getTime()
      );
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["click-stats"],
    queryFn: async () => {
      const { data: clicks } = await supabase
        .from("click_tracking")
        .select("device_type, country_code, clicked_item_type, session_id");
      
      const { data: pageViews } = await supabase
        .from("page_views")
        .select("session_id");
      
      const totalClicks = clicks?.length || 0;
      const mobileClicks = clicks?.filter(d => d.device_type === 'mobile').length || 0;
      const desktopClicks = clicks?.filter(d => d.device_type === 'desktop').length || 0;
      const uniqueCountries = new Set(clicks?.map(d => d.country_code)).size;
      const categoryClicks = clicks?.filter(d => d.clicked_item_type === 'category').length || 0;
      const webResultClicks = clicks?.filter(d => d.clicked_item_type === 'web_result').length || 0;
      const uniqueSessions = new Set(clicks?.map(d => d.session_id)).size;
      const totalPageViews = pageViews?.length || 0;

      return {
        totalClicks,
        mobileClicks,
        desktopClicks,
        uniqueCountries,
        categoryClicks,
        webResultClicks,
        uniqueSessions,
        totalPageViews,
      };
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading tracking data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="p-4">
          <div className="flex flex-col items-center text-center">
            <MousePointerClick className="w-6 h-6 text-primary mb-2" />
            <div className="text-2xl font-bold">{stats?.totalClicks || 0}</div>
            <div className="text-xs text-muted-foreground">Total Clicks</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex flex-col items-center text-center">
            <Clock className="w-6 h-6 text-primary mb-2" />
            <div className="text-2xl font-bold">{stats?.uniqueSessions || 0}</div>
            <div className="text-xs text-muted-foreground">Sessions</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex flex-col items-center text-center">
            <Globe className="w-6 h-6 text-primary mb-2" />
            <div className="text-2xl font-bold">{stats?.totalPageViews || 0}</div>
            <div className="text-xs text-muted-foreground">Page Views</div>
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
            <div className="text-xs text-muted-foreground">Related Searches</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex flex-col items-center text-center">
            <MousePointerClick className="w-6 h-6 text-primary mb-2" />
            <div className="text-2xl font-bold">{stats?.webResultClicks || 0}</div>
            <div className="text-xs text-muted-foreground">Result Clicks</div>
          </div>
        </Card>
      </div>

      {/* Session Analytics Table */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Session Analytics</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session ID</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Page Views</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Related Searches</TableHead>
                  <TableHead>Result Clicks</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionData?.map((session) => (
                  <TableRow key={session.session_id}>
                    <TableCell className="text-xs font-mono">
                      {session.session_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="text-xs font-mono">{session.ip_address}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{session.country_code}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{session.source}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {session.device_type === 'mobile' ? (
                          <Smartphone className="w-4 h-4" />
                        ) : (
                          <Monitor className="w-4 h-4" />
                        )}
                        <span className="text-xs">{session.device_type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{session.page_views}</TableCell>
                    <TableCell className="text-center font-semibold">{session.total_clicks}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
                        Total: {session.category_clicks}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-orange-500/10 text-orange-700 dark:text-orange-400">
                        Total: {session.web_result_clicks}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {format(new Date(session.last_active), 'MM/dd/yyyy HH:mm:ss')}
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
