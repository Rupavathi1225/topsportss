import type { AdminSection } from "@/pages/Admin";
import { LandingPageEditor } from "./LandingPageEditor";
import { CategoriesEditor } from "./CategoriesEditor";
import { WebResultsEditor } from "./WebResultsEditor";

interface AdminContentProps {
  activeSection: AdminSection;
}

export function AdminContent({ activeSection }: AdminContentProps) {
  return (
    <div className="max-w-6xl">
      {activeSection === "landing" && <LandingPageEditor />}
      {activeSection === "categories" && <CategoriesEditor />}
      {activeSection === "webresults" && <WebResultsEditor />}
    </div>
  );
}