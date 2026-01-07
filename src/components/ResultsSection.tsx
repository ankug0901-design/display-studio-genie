import { useState } from 'react';
import { Lightbulb, Image, AlertCircle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { POSDesignResponse } from '@/types/posDesigner';

interface ResultsSectionProps {
  result: POSDesignResponse | null;
  isLoading: boolean;
  onReset: () => void;
}

export function ResultsSection({ result, isLoading, onReset }: ResultsSectionProps) {
  const [conceptsExpanded, setConceptsExpanded] = useState(true);

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

  if (result.status === 'error' || result.status === 'limit_reached') {
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

      {/* 3D Render */}
      {result.hero_render && (
        <div className="results-card overflow-hidden">
          <div className="p-4 border-b border-border/50 flex items-center gap-2">
            <Image className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">3D Visualization</span>
          </div>
          <div className="relative bg-gradient-to-br from-secondary/50 to-muted/50 flex items-center justify-center p-4">
            <img
              src={result.hero_render}
              alt="POS Display 3D Render"
              className="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}

      {/* Design Concepts Text */}
      {result.concepts_text && (
        <div className="results-card">
          <button
            onClick={() => setConceptsExpanded(!conceptsExpanded)}
            className="w-full p-4 border-b border-border/50 flex items-center justify-between hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Design Concepts</span>
            </div>
            {conceptsExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          
          {conceptsExpanded && (
            <div className="p-6">
              <div className="prose prose-sm max-w-none text-foreground/90">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-transparent p-0 m-0 overflow-visible">
                  {result.concepts_text}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
