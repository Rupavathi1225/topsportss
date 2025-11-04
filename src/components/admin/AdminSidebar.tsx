import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, List, FileText } from "lucide-react";
import type { AdminSection } from "@/pages/Admin";

interface AdminSidebarProps {
  activeSection: AdminSection;
  setActiveSection: (section: AdminSection) => void;
}

export function AdminSidebar({ activeSection, setActiveSection }: AdminSidebarProps) {
  const menuItems = [
    { id: "landing" as AdminSection, label: "Landing Page", icon: Home },
    { id: "categories" as AdminSection, label: "Categories", icon: List },
    { id: "webresults" as AdminSection, label: "Web Results", icon: FileText },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary text-lg font-bold mb-4">
            TopSportsWin Admin
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveSection(item.id)}
                      className={`${
                        isActive
                          ? "bg-primary/20 text-primary font-semibold"
                          : "hover:bg-accent/50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="ml-3">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}