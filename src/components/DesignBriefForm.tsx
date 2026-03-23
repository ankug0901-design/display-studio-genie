import { useState } from 'react';
import { FileText, Settings2, Sparkles, ChevronDown } from 'lucide-react';
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

interface DesignBriefFormProps {
  onSubmit: (brief: POSDesignBrief) => void;
  isLoading: boolean;
}

export function DesignBriefForm({ onSubmit, isLoading }: DesignBriefFormProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
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
    onSubmit(formData);
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
