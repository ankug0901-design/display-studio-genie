import { useState, useMemo, useRef } from 'react';
import {
  Lightbulb, Image, AlertCircle, ChevronDown, ChevronUp, RefreshCw,
  Tag, MapPin, Store, Package, Hash, ChevronLeft, ChevronRight,
  Ruler, Printer, Sparkles, Wrench, Box, FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { POSDesignResponse, ConceptSpec, HeroRender } from '@/types/posDesigner';

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

// Style → soft pill badge classes
function styleBadgeClasses(style: string | undefined): string {
  const s = (style || '').toLowerCase();
  if (s.includes('premium') || s.includes('elegant')) return 'text-amber-700 bg-amber-50 border-amber-200';
  if (s.includes('bold') || s.includes('eye') || s.includes('impact') || s.includes('vivid')) return 'text-pink-700 bg-pink-50 border-pink-200';
  if (s.includes('minimal') || s.includes('clean')) return 'text-slate-600 bg-slate-100 border-slate-200';
  if (s.includes('eco') || s.includes('sustain')) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  return 'text-accent bg-accent/10 border-accent/20';
}

function styleAccentRing(style: string | undefined, active: boolean): string {
  const s = (style || '').toLowerCase();
  if (!active) return 'border-border/60 hover:border-accent/40 bg-card';
  if (s.includes('premium') || s.includes('elegant')) return 'border-amber-400 bg-amber-50/60';
  if (s.includes('bold') || s.includes('eye') || s.includes('impact') || s.includes('vivid')) return 'border-pink-400 bg-pink-50/60';
  if (s.includes('minimal') || s.includes('clean')) return 'border-slate-400 bg-slate-100/60';
  if (s.includes('eco') || s.includes('sustain')) return 'border-emerald-400 bg-emerald-50/60';
  return 'border-accent bg-accent/10';
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
      const finalBullets = bullets.length > 0 ? bullets : lines.slice(1).map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
      return { number: i + 1, title, bullets: finalBullets };
    });
}

function isDisplayableImage(url: string | null | undefined): boolean {
  return !!url && (url.startsWith('https://') || url.startsWith('data:'));
}

const SPEC_FIELDS: { key: keyof ConceptSpec; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'rationale', label: 'Rationale', icon: Lightbulb },
  { key: 'size', label: 'Size', icon: Ruler },
  { key: 'material', label: 'Material', icon: Package },
  { key: 'printing', label: 'Printing', icon: Printer },
  { key: 'finishing', label: 'Finishing', icon: Sparkles },
  { key: 'assembly', label: 'Assembly', icon: Wrench },
  { key: 'packing', label: 'Packing', icon: Box },
  { key: 'placement', label: 'Placement', icon: MapPin },
];

export function ResultsSection({ result, isLoading, onReset }: ResultsSectionProps) {
  const [conceptsExpanded, setConceptsExpanded] = useState(true);
  const [specsExpanded, setSpecsExpanded] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const renderSectionRef = useRef<HTMLDivElement>(null);

  const textConcepts = useMemo(() => {
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
            Our AI is crafting professional POSM design concepts and rendering photorealistic 3D visualizations...
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

  const quantityDisplay = typeof result.quantity === 'number'
    ? result.quantity.toLocaleString()
    : result.quantity;

  const metaItems = [
    { icon: Tag, label: 'Brand', value: result.brand },
    { icon: Package, label: 'POSM Type', value: result.posm_type },
    { icon: Store, label: 'Store Environment', value: result.store_environment },
    { icon: MapPin, label: 'Placement', value: result.placement_location },
    { icon: Hash, label: 'Quantity', value: quantityDisplay },
  ].filter(item => item.value);

  // New multi-concept data
  const heroRenders: HeroRender[] = result.hero_renders && result.hero_renders.length > 0
    ? result.hero_renders
    : [];
  const concepts: ConceptSpec[] = result.concepts && result.concepts.length > 0
    ? result.concepts
    : [];

  const hasMultiConcept = heroRenders.length > 0;
  const safeIndex = Math.min(selectedIndex, Math.max(0, (hasMultiConcept ? heroRenders.length : 1) - 1));

  const selectedRender = hasMultiConcept ? heroRenders[safeIndex] : null;
  const selectedConcept = concepts[safeIndex] || null;

  const goTo = (idx: number) => {
    const count = hasMultiConcept ? heroRenders.length : 1;
    setSelectedIndex(((idx % count) + count) % count);
  };

  const scrollToRender = (idx: number) => {
    setSelectedIndex(idx);
    renderSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

      {/* Brief Metadata Bar */}
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
                  <p className="text-sm font-medium text-foreground break-words">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Concept Selector Tabs (multi-concept only) */}
      {hasMultiConcept && (
        <div className="sticky top-[68px] z-30 -mx-1 px-1 py-2 bg-background/80 backdrop-blur-sm rounded-xl">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {heroRenders.map((hr, idx) => {
              const active = idx === safeIndex;
              return (
                <button
                  key={hr.concept_number}
                  onClick={() => setSelectedIndex(idx)}
                  className={`flex flex-col items-start gap-1 shrink-0 px-4 py-2.5 rounded-xl border-2 text-left transition-all duration-200 ${styleAccentRing(hr.style, active)}`}
                >
                  <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                    Concept {hr.concept_number}
                  </span>
                  <span className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${styleBadgeClasses(hr.style)}`}>
                    {hr.style}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3D Visualization Section */}
      <div ref={renderSectionRef} className="results-card overflow-hidden scroll-mt-32">
        <div className="p-4 border-b border-border/50 flex items-center gap-2">
          <Image className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-foreground">3D Visualization</span>
        </div>

        {hasMultiConcept && isDisplayableImage(selectedRender?.image_url) ? (
          <div className="relative bg-gradient-to-br from-secondary/50 to-muted/50 flex items-center justify-center p-4">
            <img
              key={selectedRender!.image_url}
              src={selectedRender!.image_url}
              alt={`${selectedRender!.concept_title} 3D Render`}
              className="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg animate-fade-in"
            />

            {/* Nav arrows */}
            {heroRenders.length > 1 && (
              <>
                <button
                  onClick={() => goTo(safeIndex - 1)}
                  aria-label="Previous concept"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 border border-border shadow-md flex items-center justify-center hover:bg-card transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                <button
                  onClick={() => goTo(safeIndex + 1)}
                  aria-label="Next concept"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 border border-border shadow-md flex items-center justify-center hover:bg-card transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
              </>
            )}

            {/* Caption overlay */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-foreground/80 backdrop-blur-sm text-background text-xs font-medium whitespace-nowrap">
              Concept {selectedRender!.concept_number} — {selectedRender!.style}
            </div>
          </div>
        ) : isDisplayableImage(result.hero_render) ? (
          // Backward-compatible single render
          <div className="relative bg-gradient-to-br from-secondary/50 to-muted/50 flex items-center justify-center p-4">
            <img
              src={result.hero_render!}
              alt="POS Display 3D Render"
              className="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6 bg-gradient-to-br from-secondary/50 to-muted/50 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
              <Image className="w-8 h-8 text-accent/50" />
            </div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Render Coming Soon</h4>
            <p className="text-xs text-muted-foreground max-w-xs">
              Your photorealistic 3D visualization is being processed and will be available shortly.
            </p>
          </div>
        )}
      </div>

      {/* Design Specifications Section (structured concepts) */}
      {selectedConcept && (
        <div className="results-card overflow-hidden">
          <button
            onClick={() => setSpecsExpanded(!specsExpanded)}
            className="w-full p-4 border-b border-border/50 flex items-center justify-between hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-2 text-left">
              <Ruler className="w-4 h-4 text-accent shrink-0" />
              <span className="text-sm font-medium text-foreground">
                Design Specifications — Concept {selectedConcept.number}: {selectedConcept.title}
              </span>
            </div>
            {specsExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
          </button>

          {specsExpanded && (
            <div className="divide-y divide-border/50 animate-fade-in">
              {SPEC_FIELDS.map(({ key, label, icon: Icon }, rowIdx) => {
                const value = selectedConcept[key] as string | undefined;
                if (!value) return null;
                return (
                  <div
                    key={key}
                    className={`grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-1 sm:gap-4 px-5 py-4 ${rowIdx % 2 === 1 ? 'bg-secondary/30' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-accent shrink-0" />
                      <span className="text-sm font-medium text-foreground">{label}</span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">{value}</p>
                  </div>
                );
              })}
              {selectedConcept.visual_description && (
                <div className="px-5 py-4 bg-accent/5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Image className="w-4 h-4 text-accent shrink-0" />
                    <span className="text-sm font-medium text-foreground">Visual Description</span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{selectedConcept.visual_description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* All Concepts at a Glance */}
      {hasMultiConcept && heroRenders.length > 1 && (
        <div>
          <h3 className="text-base font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            All Concepts at a Glance
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {heroRenders.map((hr, idx) => (
              <button
                key={hr.concept_number}
                onClick={() => scrollToRender(idx)}
                className={`results-card overflow-hidden text-left transition-all duration-200 hover:shadow-xl ${idx === safeIndex ? 'ring-2 ring-accent' : ''}`}
              >
                <div className="aspect-square bg-gradient-to-br from-secondary/50 to-muted/50 flex items-center justify-center p-3">
                  {isDisplayableImage(hr.image_url) ? (
                    <img
                      src={hr.image_url}
                      alt={hr.concept_title}
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  ) : (
                    <Image className="w-10 h-10 text-accent/40" />
                  )}
                </div>
                <div className="p-4">
                  <span className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full border mb-2 ${styleBadgeClasses(hr.style)}`}>
                    {hr.style}
                  </span>
                  <p className="text-sm font-medium text-foreground">{hr.concept_title}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fallback: text concepts when no structured concepts array */}
      {concepts.length === 0 && textConcepts.length > 0 && (
        <div>
          <button
            onClick={() => setConceptsExpanded(!conceptsExpanded)}
            className="w-full p-4 rounded-xl bg-card border border-border/50 flex items-center justify-between hover:bg-secondary/30 transition-colors mb-4"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">
                Design Concepts ({textConcepts.length})
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
              {textConcepts.map((concept, idx) => (
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

      {/* Fallback: raw text */}
      {concepts.length === 0 && textConcepts.length === 0 && result.concepts_text && result.concepts_text !== 'Design concepts not available' && (
        <div className="results-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-accent" />
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
