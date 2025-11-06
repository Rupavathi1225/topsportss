import { LandingPageEditor } from "@/components/admin/LandingPageEditor";
import { CategoriesEditor } from "@/components/admin/CategoriesEditor";
import { WebResultsEditor } from "@/components/admin/WebResultsEditor";

const Admin = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-primary/30 sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-16">
          {/* Website Section */}
          <section id="website" className="scroll-mt-20">
            <h2 className="text-xl font-semibold mb-6 text-foreground border-b pb-2">
              Website
            </h2>
            <LandingPageEditor />
          </section>

          {/* Related Search Section */}
          <section id="related-search" className="scroll-mt-20">
            <h2 className="text-xl font-semibold mb-6 text-foreground border-b pb-2">
              Related Search
            </h2>
            <CategoriesEditor />
          </section>

          {/* Web Results Section */}
          <section id="web-results" className="scroll-mt-20">
            <h2 className="text-xl font-semibold mb-6 text-foreground border-b pb-2">
              Sponsored & Web Results
            </h2>
            <WebResultsEditor />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Admin;