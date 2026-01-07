import { useState, useCallback } from 'react';
import { POSDesignBrief, POSDesignResponse } from '@/types/posDesigner';
import { toast } from 'sonner';

const WEBHOOK_URL = 'https://n8n.srv1141999.hstgr.cloud/webhook/pos-display-design';

export function usePOSDesigner() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<POSDesignResponse | null>(null);

  const submitBrief = useCallback(async (brief: POSDesignBrief) => {
    setIsLoading(true);
    setResult(null);

    try {
      // Prepare form data for multipart submission if artwork exists
      const hasArtwork = brief.artwork instanceof File;
      
      let response: Response;

      if (hasArtwork) {
        const formData = new FormData();
        formData.append('brand_name', brief.brand_name);
        formData.append('product_category', brief.product_category);
        formData.append('display_type', brief.display_type);
        formData.append('quantity', brief.quantity.toString());
        formData.append('objective', brief.objective);
        
        if (brief.size) formData.append('size', brief.size);
        if (brief.material) formData.append('material', brief.material);
        if (brief.budget) formData.append('budget', brief.budget);
        if (brief.store_environment) formData.append('store_environment', brief.store_environment);
        if (brief.placement_location?.length) {
          formData.append('placement_location', brief.placement_location.join(', '));
        }
        if (brief.artwork) {
          formData.append('artwork', brief.artwork);
        }

        response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          body: formData,
        });
      } else {
        // JSON submission without artwork
        const payload = {
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
        };

        response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: POSDesignResponse = await response.json();
      
      if (data.status === 'limit_reached') {
        toast.warning('Daily limit reached. Please try again tomorrow.');
      } else if (data.status === 'success') {
        toast.success('Design concepts generated successfully!');
      }

      setResult(data);
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
