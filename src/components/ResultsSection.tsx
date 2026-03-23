import { useState, useMemo } from 'react';
import { Lightbulb, Image, AlertCircle, ChevronDown, ChevronUp, RefreshCw, Tag, MapPin, Store, Package, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { POSDesignResponse } from '@/types/posDesigner';

interface ResultsSectionProps {
  result: POSDesignResponse | null;
  isLoading: boolean;
  onReset: () => void;
}

interface ParsedConcept {
  number: number;
  title: string;
  bullets: string[];
}

function parseConceptsText(text: string): ParsedConcept[] {
  return text
    .split(/CONCEPT \d+:/i)
    .filter(c => c.trim().length > 0)
    .map((c, i) => {
      const lines = c.trim().split('\n').map(l => l.trim()).filter(Boolean);
      const title = lines[0]?.replace(/^[-—–•*]\s*/, '').trim() || `Concept ${i + 1}`;
      const bullets = lines.slice(1)
        .filter(l => l.startsWith('-') || l.startsWith('•') || l.startsWith('*'))
        .map(l => l.replace(/^[-•*]\s*/, '').trim())
        .filter(Boolean);
      // If no bullet lines found, treat all lines after title as bullets
      const finalBullets = bullets.length > 0 ? bullets : lines.slice(1).map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
      return { number: i + 1, title, bullets: finalBullets };
    });
}

function shouldShowPlaceholder(url: string | null | undefined): boolean {
  if (!url) return true;
  if (url.startsWith('https://') || url.startsWith('data:')) return false;
  return true;
}

export function ResultsSection({ result, isLoading, onReset }: ResultsSectionProps) {
  const [conceptsExpanded, setConceptsExpanded] = useState(true);

  const concepts = useMemo(() => {
    if (!result?.concepts_text) return [];
    return parseConceptsText(result.concepts_text);
  }, [result?.concepts_text]);

  if (isLoading) {
    return (
      <div className="results-card animate-fade-in">
        <div className="p-8 sm:p-12 flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-accent/10" />
            </div>
          </div>
          <h3 className="text-lg font-display font-semibold text-foreground mb-2">
            Generating Your Design Concepts
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Our AI is crafting professional POSM design concepts and rendering a photorealistic 3D visualization...
          </p>
          <div className="flex items-center gap-2 mt-6 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            This may take 30-60 seconds
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  if (result.status !== 'success') {
    return (
      <div className="results-card animate-fade-in">
        <div className="p-8 sm:p-12 flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7 text-destructive" />
          </div>
          <h3 className="text-lg font-display font-semibold text-foreground mb-2">
            {result.status === 'limit_reached' ? 'Daily Limit Reached' : 'Something Went Wrong'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            {result.message || result.error || 'An unexpected error occurred. Please try again.'}
          </p>
          <Button variant="outline" onClick={onReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const metaItems = [
    { icon: Tag, label: 'Brand', value: result.brand },
    { icon: Package, label: 'POSM Type', value: result.posm_type },
    { icon: Store, label: 'Store Environment', value: result.store_environment },
    { icon: MapPin, label: 'Placement', value: result.placement_location },
    { icon: Hash, label: 'Quantity', value: result.quantity?.toLocaleString() },
  ].filter(item => item.value);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground">
            Design Concepts Ready
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {result.brand} — {result.posm_type}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          New Brief
        </Button>
      </div>

      {/* Brief Metadata */}
      {metaItems.length > 0 && (
        <div className="results-card p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {metaItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium text-foreground truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3D Render / Placeholder */}
      <div className="results-card overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center gap-2">
          <Image className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-foreground">3D Visualization</span>
        </div>
        {shouldShowPlaceholder(result.hero_render) ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 bg-gradient-to-br from-secondary/50 to-muted/50 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
              <Image className="w-8 h-8 text-accent/50" />
            </div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Render Coming Soon</h4>
            <p className="text-xs text-muted-foreground max-w-xs">
              Your photorealistic 3D visualization is being processed and will be available shortly.
            </p>
          </div>
        ) : (
          <div className="relative bg-gradient-to-br from-secondary/50 to-muted/50 flex items-center justify-center p-4">
            <img
              src={result.hero_render!}
              alt="POS Display 3D Render"
              className="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg"
            />
          </div>
        )}
      </div>

      {/* Design Concepts - Parsed into Cards */}
      {concepts.length > 0 && (
        <div>
          <button
            onClick={() => setConceptsExpanded(!conceptsExpanded)}
            className="w-full p-4 rounded-xl bg-card border border-border/50 flex items-center justify-between hover:bg-secondary/30 transition-colors mb-4"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">
                Design Concepts ({concepts.length})
              </span>
            </div>
            {conceptsExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {conceptsExpanded && (
            <div className="grid gap-4">
              {concepts.map((concept, idx) => (
                <div key={idx} className="results-card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center">
                      {concept.number}
                    </span>
                    <h4 className="text-base font-display font-semibold text-foreground">
                      {concept.title}
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {concept.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent/40 mt-1.5 shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fallback: raw text if parsing yielded nothing */}
      {concepts.length === 0 && result.concepts_text && result.concepts_text !== 'Design concepts not available' && (
        <div className="results-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">Design Concepts</span>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
            {result.concepts_text}
          </pre>
        </div>
      )}
    </div>
  );
}
