import { useState, useCallback } from 'react';
import { POSDesignBrief, POSDesignResponse } from '@/types/posDesigner';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const FUNCTION_NAME = 'pos-design-proxy';
const MAX_WEBHOOK_PAYLOAD_BYTES = 1800 * 1024;
const MAX_ARTWORK_FILE_BYTES = 1200 * 1024;

export function usePOSDesigner() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<POSDesignResponse | null>(null);

  const estimatePayloadSize = (payload: Record<string, unknown>) => {
    const json = JSON.stringify(payload);
    return new TextEncoder().encode(json).length;
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const submitBrief = useCallback(async (brief: POSDesignBrief, artworkFile?: File | null) => {
    setIsLoading(true);
    setResult(null);

    try {
      const payload: Record<string, unknown> = {
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

      if (artworkFile) {
        if (artworkFile.size > MAX_ARTWORK_FILE_BYTES) {
          throw new Error('ARTWORK_TOO_LARGE');
        }

        payload.artwork_base64 = await fileToBase64(artworkFile);
        payload.artwork_mime_type = artworkFile.type;
      }

      if (estimatePayloadSize(payload) > MAX_WEBHOOK_PAYLOAD_BYTES) {
        throw new Error('PAYLOAD_TOO_LARGE');
      }

      const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
        body: payload,
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

      if (errorMessage === 'ARTWORK_TOO_LARGE' || errorMessage === 'PAYLOAD_TOO_LARGE') {
        const message = 'Artwork is too large for processing. Please upload a smaller file (recommended under 1200KB).';
        toast.error(message);
        setResult({
          status: 'error',
          error: 'payload_too_large',
          message,
        });
        return;
      }
      
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
