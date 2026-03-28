import { useState, useRef } from 'react';
import { FileText, Settings2, Sparkles, ChevronDown, Upload, X, Crown, Zap, Layers, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FormSection } from './FormSection';
import { FormField } from './FormField';
import {
  POSDesignBrief,
  PRODUCT_CATEGORIES,
  DISPLAY_TYPES,
  MATERIALS,
  STORE_ENVIRONMENTS,
  PLACEMENT_LOCATIONS,
} from '@/types/posDesigner';
import { toast } from 'sonner';

interface DesignBriefFormProps {
  onSubmit: (brief: POSDesignBrief, artworkFile?: File | null) => void;
  isLoading: boolean;
}

export function DesignBriefForm({ onSubmit, isLoading }: DesignBriefFormProps) {
  const MAX_ARTWORK_FILE_BYTES = 1200 * 1024;
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<POSDesignBrief>({
    brand_name: '',
    product_category: '',
    display_type: '',
    quantity: 100,
    objective: '',
    size: '',
    material: '',
    budget: '',
    store_environment: '',
    placement_location: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, artworkFile);
  };

  const updateField = <K extends keyof POSDesignBrief>(field: K, value: POSDesignBrief[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const togglePlacement = (location: string) => {
    const current = formData.placement_location || [];
    const updated = current.includes(location)
      ? current.filter(l => l !== location)
      : [...current, location];
    updateField('placement_location', updated);
  };

  const isFormValid = formData.brand_name && formData.product_category && 
                      formData.display_type && formData.quantity > 0 && formData.objective;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Core Brief Section */}
      <FormSection title="Design Brief" icon={<FileText className="w-4 h-4 text-accent" />}>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Brand Name" htmlFor="brand_name" required>
            <Input
              id="brand_name"
              placeholder="e.g., L'Oréal Paris"
              value={formData.brand_name}
              onChange={e => updateField('brand_name', e.target.value)}
              className="premium-border"
            />
          </FormField>

          <FormField label="Product Category" htmlFor="product_category" required>
            <Select value={formData.product_category} onValueChange={v => updateField('product_category', v)}>
              <SelectTrigger className="premium-border">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="POS Display Type" htmlFor="display_type" required>
            <Select value={formData.display_type} onValueChange={v => updateField('display_type', v)}>
              <SelectTrigger className="premium-border">
                <SelectValue placeholder="Select display type" />
              </SelectTrigger>
              <SelectContent>
                {DISPLAY_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Estimated Quantity" htmlFor="quantity" required>
            <Input
              id="quantity"
              type="number"
              min={1}
              placeholder="e.g., 500"
              value={formData.quantity}
              onChange={e => updateField('quantity', parseInt(e.target.value) || 0)}
              className="premium-border"
            />
          </FormField>

          <div className="sm:col-span-2">
            <FormField 
              label="Campaign Objective" 
              htmlFor="objective" 
              required
              helper="Describe the goal: product launch, seasonal promotion, brand visibility, etc."
            >
              <Textarea
                id="objective"
                placeholder="e.g., New product launch for premium skincare line targeting modern trade outlets during festive season..."
                value={formData.objective}
                onChange={e => updateField('objective', e.target.value)}
                className="premium-border min-h-[100px] resize-none"
              />
            </FormField>
          </div>

          <div className="sm:col-span-2">
            <FormField 
              label="Design / Artwork File" 
              htmlFor="artwork"
              helper="Upload brand artwork, logo, or reference design (PDF, PNG, JPG — recommended under 1200KB)"
            >
              <input
                ref={fileInputRef}
                type="file"
                id="artwork"
                accept=".pdf,.png,.jpg,.jpeg,.ai,.psd"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0] || null;
                  if (file && file.size > MAX_ARTWORK_FILE_BYTES) {
                    setArtworkFile(null);
                    toast.error('File too large. Please upload artwork under 1200KB.');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    return;
                  }
                  setArtworkFile(file);
                }}
              />
              {artworkFile ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <FileText className="w-5 h-5 text-accent shrink-0" />
                  <span className="text-sm text-foreground truncate flex-1">{artworkFile.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setArtworkFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-accent/50 hover:bg-accent/5 transition-colors text-sm text-muted-foreground"
                >
                  <Upload className="w-4 h-4" />
                  Click to upload artwork
                </button>
              )}
            </FormField>
          </div>
        </div>
      </FormSection>

      {/* Advanced Options */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-foreground/80">
              <Settings2 className="w-4 h-4 text-muted-foreground" />
              Advanced Options
            </span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${advancedOpen ? 'rotate-180' : ''}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <FormSection title="Specifications" className="bg-secondary/30">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Size Constraints" htmlFor="size" helper="e.g., Max 600mm W × 1800mm H × 400mm D">
                <Input
                  id="size"
                  placeholder="W × H × D in mm"
                  value={formData.size}
                  onChange={e => updateField('size', e.target.value)}
                  className="premium-border"
                />
              </FormField>

              <FormField label="Material Preference" htmlFor="material">
                <Select value={formData.material} onValueChange={v => updateField('material', v)}>
                  <SelectTrigger className="premium-border">
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIALS.map(mat => (
                      <SelectItem key={mat} value={mat}>{mat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Budget Range" htmlFor="budget" helper="Per unit in USD">
                <Input
                  id="budget"
                  placeholder="e.g., $50-100 per unit"
                  value={formData.budget}
                  onChange={e => updateField('budget', e.target.value)}
                  className="premium-border"
                />
              </FormField>

              <FormField label="Store Environment" htmlFor="store_environment">
                <Select value={formData.store_environment} onValueChange={v => updateField('store_environment', v)}>
                  <SelectTrigger className="premium-border">
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    {STORE_ENVIRONMENTS.map(env => (
                      <SelectItem key={env} value={env}>{env}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <div className="sm:col-span-2">
                <FormField label="Placement Location">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                    {PLACEMENT_LOCATIONS.map(loc => (
                      <label
                        key={loc}
                        className="flex items-center gap-2 text-sm cursor-pointer group"
                      >
                        <Checkbox
                          checked={formData.placement_location?.includes(loc)}
                          onCheckedChange={() => togglePlacement(loc)}
                        />
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                          {loc}
                        </span>
                      </label>
                    ))}
                  </div>
                </FormField>
              </div>
            </div>
          </FormSection>
        </CollapsibleContent>
      </Collapsible>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="accent"
        size="xl"
        className="w-full"
        disabled={!isFormValid || isLoading}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
            Generating Concepts...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate POS Display Concepts
          </>
        )}
      </Button>
    </form>
  );
}
