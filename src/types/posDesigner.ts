export interface POSDesignBrief {
  // Required fields
  brand_name: string;
  product_category: string;
  display_type: string;
  quantity: number;
  objective: string;
  
  // Optional fields
  size?: string;
  material?: string;
  budget?: string;
  store_environment?: string;
  placement_location?: string[];
  artwork?: File | null;
}

export interface POSDesignResponse {
  status: 'success' | 'error' | 'limit_reached';
  brand?: string;
  posm_type?: string;
  concepts_text?: string;
  hero_render?: string | null;
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
  'Parasite Hanger / Clip Strip',
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
  'Near Competitor Products'
] as const;
