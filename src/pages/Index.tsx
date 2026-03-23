import { Header } from '@/components/Header';
import { DesignBriefForm } from '@/components/DesignBriefForm';
import { ResultsSection } from '@/components/ResultsSection';
import { usePOSDesigner } from '@/hooks/usePOSDesigner';

const Index = () => {
  const { isLoading, result, submitBrief, reset } = usePOSDesigner();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-10 sm:mb-14 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-soft text-accent-soft-foreground text-xs font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Retail Design Studio
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold text-foreground tracking-tight mb-4">
              Create stunning POS displays
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Submit your design brief and receive professional POSM concepts 
              with photorealistic 3D renders in minutes.
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-12">
            {/* Form Section - Hidden when showing results */}
            {!result && (
              <div className="animate-slide-up">
                <DesignBriefForm onSubmit={(brief, file) => submitBrief(brief, file)} isLoading={isLoading} />
              </div>
            )}

            {/* Results Section */}
            {(isLoading || result) && (
              <ResultsSection 
                result={result} 
                isLoading={isLoading} 
                onReset={reset}
              />
            )}
          </div>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground">
              Powered by AI • Designed for retail excellence
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Index;
