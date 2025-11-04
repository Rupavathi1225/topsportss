import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminContent } from "@/components/admin/AdminContent";
import { useState } from "react";

export type AdminSection = "landing" | "categories" | "webresults";

const Admin = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>("landing");

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-background">
        <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-1 p-8">
          <AdminContent activeSection={activeSection} />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Admin;