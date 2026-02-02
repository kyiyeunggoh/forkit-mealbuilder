export enum Screen {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD'
}

export interface UserPreferences {
  city: string;
  cookingLevel: 'Comfort' | 'Adventurous';
  motivation: 'Save Money' | 'Eat Healthy' | 'Reduce Waste' | 'Quick Win';
  name: string;
}

export interface FilterState {
  time: string;   // e.g. '20'
  effort: string; // e.g. 'minimal'
  meal: string;   // e.g. 'dinner'
  cuisine?: string; // Optional specific cuisine
}

export interface Ingredient {
  name: string;
  category: 'produce' | 'protein' | 'pantry' | 'dairy' | 'other';
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  matchScore: number; // 0-100 based on ingredients
  timeMinutes: number;
  effort: string;
  calories?: number;
  protein?: number;
  // Social Proof Fields
  rating: number;
  reviewCount: number;
  featuredOn?: string; // e.g., "NYT Cooking"
  userSentiment: string; // e.g., "Loved for its quick prep"
  ingredients: string[];
  missingIngredients: string[];
  savedAt?: number; // Timestamp for saved recipes
  searchQuery?: string; // Specific query to find the real recipe
}
