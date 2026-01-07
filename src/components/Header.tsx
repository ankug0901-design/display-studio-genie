import { Layers } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Layers className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-display font-semibold text-foreground tracking-tight">
              POS Display Lab
            </h1>
            <p className="text-xs text-muted-foreground font-sans">
              AI-powered retail display concept generator
            </p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse-subtle" />
          <span>Design Studio</span>
        </div>
      </div>
    </header>
  );
}
