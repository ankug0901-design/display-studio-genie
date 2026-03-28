export interface POSDesignBrief {
  brand_name: string;
  product_category: string;
  display_type: string;
  quantity: number;
  objective: string;
  size?: string;
  material?: string;
  budget?: string;
  store_environment?: string;
  placement_location?: string[];
  style?: StyleOption;
  strict_mode?: boolean;
}

export interface POSDesignResponse {
  status: 'success' | 'error' | 'limit_reached';
  brand?: string;
  product_category?: string;
  posm_type?: string;
  quantity?: number;
  objective?: string;
  store_environment?: string;
  placement_location?: string;
  concepts_text?: string;
  hero_render?: string | null;
  style_label?: string;
  posm_type_label?: string;
  message?: string;
  error?: string;
}

export const PRODUCT_CATEGORIES = [
  'Beauty & Cosmetics',
  'Personal Care',
  'FMCG - Food & Beverages',
  'FMCG - Household',
  'Electronics & Gadgets',
  'Health & Wellness',
  'Fashion & Accessories',
  'Home & Living',
  'Automotive',
  'Other'
] as const;

export const DISPLAY_TYPES = [
  'Counter Top Unit (CTU)',
  'Floor Standing Unit (FSU)',
  'Gondola End Display',
  'Wall Display / Category Branding',
  'Parasite',
  'Clip Strip',
  'Display Arch / Header',
  'Checkout Counter Display',
  'Window Display',
  'Island Display',
  'Pallet Display'
] as const;

export const MATERIALS = [
  'Acrylic',
  'MDF / Wood',
  'Corrugated Cardboard',
  'Sunboard / Foam Board',
  'Metal / Steel',
  'Plastic Honeycomb',
  'Corrugated Plastic / PP Sheets',
  'Mixed Materials',
  'Eco-friendly / Recyclable',
  'No Preference'
] as const;

export const STORE_ENVIRONMENTS = [
  'Modern Trade (Supermarket/Hypermarket)',
  'General Trade (Traditional Retail)',
  'Pharmacy / Drugstore',
  'Specialty Store',
  'Department Store',
  'Convenience Store',
  'E-commerce Warehouse'
] as const;

export const PLACEMENT_LOCATIONS = [
  'Checkout / Billing Counter',
  'Main Aisle',
  'Category Shelf / Gondola',
  'End Cap / Gondola End',
  'Store Entrance',
  'Window Display Area',
  'Near Competitor Products',
  'GT Store'
] as const;
