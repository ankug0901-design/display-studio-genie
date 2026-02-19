import { useState, useCallback } from 'react';
import { POSDesignBrief, POSDesignResponse } from '@/types/posDesigner';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const FUNCTION_NAME = 'pos-design-proxy';

export function usePOSDesigner() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<POSDesignResponse | null>(null);

  const submitBrief = useCallback(async (brief: POSDesignBrief) => {
    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
        body: {
          brand_name: brief.brand_name,
          product_category: brief.product_category,
          display_type: brief.display_type,
          quantity: brief.quantity,
          objective: brief.objective,
          size: brief.size || undefined,
          material: brief.material || undefined,
          budget: brief.budget || undefined,
          store_environment: brief.store_environment || undefined,
          placement_location: brief.placement_location?.join(', ') || undefined,
        },
      });

      if (error) throw error;

      const responseData = data as POSDesignResponse;
      
      if (responseData.status === 'limit_reached') {
        toast.warning('Daily limit reached. Please try again tomorrow.');
      } else if (responseData.status === 'success') {
        toast.success('Design concepts generated successfully!');
      }

      setResult(responseData);
    } catch (error) {
      console.error('POS Designer error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      toast.error('Failed to generate concepts. Please try again.');
      
      setResult({
        status: 'error',
        error: errorMessage,
        message: 'Failed to connect to the design service. Please check your connection and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
  }, []);

  return {
    isLoading,
    result,
    submitBrief,
    reset,
  };
}
