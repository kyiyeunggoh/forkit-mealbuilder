import ReactGA from "react-ga4";

// Your specific Measurement ID
const MEASUREMENT_ID = "G-XKTMCW5YDP"; 

export const Analytics = {
  initialize: () => {
    if (MEASUREMENT_ID) {
        ReactGA.initialize(MEASUREMENT_ID);
        console.log("Analytics Initialized with ID:", MEASUREMENT_ID);
    } else {
        console.warn("Analytics ID not provided.");
    }
  },

  trackPageView: (page: string) => {
    ReactGA.send({ hitType: "pageview", page });
  },

  // User Lifecycle
  trackOnboardingCompleted: (method: string) => {
    ReactGA.event({
      category: "User",
      action: "onboarding_completed",
      label: method // e.g., 'new_user'
    });
  },

  // Feature Usage
  trackFridgeScan: (status: 'success' | 'failed' | 'unsafe', itemCount?: number) => {
    ReactGA.event({
      category: "Feature",
      action: `fridge_scan_${status}`,
      value: itemCount || 0
    });
  },

  trackManualIngredientAdd: (ingredient: string) => {
    ReactGA.event({
      category: "Feature",
      action: "manual_add_ingredient",
      label: ingredient
    });
  },

  // Core Value
  trackRecipeGeneration: (vibe: string, filters: any) => {
    ReactGA.event({
      category: "Core",
      action: "generate_recipes",
      label: vibe
    });
  },

  trackRecipeSaved: (recipeTitle: string) => {
    ReactGA.event({
      category: "Core",
      action: "save_recipe",
      label: recipeTitle
    });
  },

  trackRecipeClick: (recipeTitle: string, source: string) => {
    ReactGA.event({
      category: "Outbound",
      action: "view_instructions_click",
      label: `${recipeTitle} (${source})`
    });
  },

  trackSafetyViolation: (triggerType: 'image' | 'text') => {
    ReactGA.event({
      category: "Safety",
      action: "safety_violation",
      label: triggerType
    });
  }
};