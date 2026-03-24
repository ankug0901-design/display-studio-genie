import { useState, useCallback } from 'react';
import { POSDesignBrief, POSDesignResponse } from '@/types/posDesigner';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const FUNCTION_NAME = 'pos-design-proxy';
const MAX_ARTWORK_FILE_BYTES = 1200 * 1024;

export function usePOSDesigner() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<POSDesignResponse | null>(null);

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

  const compressImage = (file: File, maxSizeKB = 700): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Scale down if very large
        const MAX_DIM = 1600;
        if (width > MAX_DIM || height > MAX_DIM) {
          const scale = MAX_DIM / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        ctx.drawImage(img, 0, 0, width, height);

        // Try progressively lower quality
        let quality = 0.8;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        while (dataUrl.length * 0.75 > maxSizeKB * 1024 && quality > 0.2) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve({
          base64: dataUrl.split(',')[1],
          mimeType: 'image/jpeg',
        });
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = url;
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

        const isImage = artworkFile.type.startsWith('image/');

        if (isImage) {
          // Compress images to reduce base64 payload size
          const compressed = await compressImage(artworkFile);
          payload.artwork_base64 = compressed.base64;
          payload.artwork_mime_type = compressed.mimeType;
        } else {
          // PDFs and other files sent as-is
          payload.artwork_base64 = await fileToBase64(artworkFile);
          payload.artwork_mime_type = artworkFile.type;
        }
      }

      const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
        body: payload,
      });

      if (error) {
        // Try to read the response body from the error context
        let errorBody: Record<string, unknown> | null = null;
        try {
          if (error.context && typeof error.context === 'object' && 'json' in error.context) {
            errorBody = await (error.context as Response).json();
          }
        } catch { /* ignore parse errors */ }

        const errMsg = errorBody?.message as string || errorBody?.error as string || error.message || '';
        
        if (errMsg.includes('413') || errMsg.includes('payload_too_large')) {
          throw new Error('PAYLOAD_TOO_LARGE');
        }
        if (errMsg.includes('504') || errMsg.includes('gateway_timeout') || errMsg.includes('Gateway Time-out')) {
          throw new Error('GATEWAY_TIMEOUT');
        }
        
        // If the n8n workflow returned an error, show it
        if (errorBody?.message) {
          throw new Error(String(errorBody.message));
        }
        
        throw error;
      }

      const responseData = data as POSDesignResponse;
      
      if (responseData?.error === 'payload_too_large') {
        throw new Error('PAYLOAD_TOO_LARGE');
      }

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
        const message = 'Artwork file is too large for processing. Try uploading a smaller or lower-resolution file, or increase your n8n server\'s nginx client_max_body_size.';
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
