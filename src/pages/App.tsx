import { LogoDropdown } from "@/components/LogoDropdown";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center border-b border-border/50 px-4 py-3">
        <LogoDropdown />

        <div className="ml-3">
          <h1 className="text-sm font-semibold">satQuery</h1>
          <p className="text-xs text-muted-foreground">
            Satellite Imagery Analysis
          </p>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-65px)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            SatQuery
          </h2>

          <p className="mt-2 text-muted-foreground">
            Your satellite imagery analysis workspace
          </p>
        </div>
      </main>
    </div>
  );
}