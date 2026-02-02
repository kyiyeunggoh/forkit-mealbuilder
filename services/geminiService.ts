import { GoogleGenAI, Type } from "@google/genai";
import { Ingredient, Recipe, UserPreferences, FilterState } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 1. Identify Ingredients from Image (Fridge Scan)
export const identifyIngredientsFromImage = async (base64Image: string): Promise<Ingredient[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming JPEG for camera captures
              data: base64Image,
            },
          },
          {
            text: `Analyze this image of food/fridge. List the visible ingredients. 
                   Return a JSON array where each item has "name" and "category" (produce, protein, pantry, dairy, other).
                   Ignore non-food items. Be specific (e.g., "Red Bell Pepper" instead of "Pepper").`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ["name", "category"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as Ingredient[];
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return [];
  }
};

// 2. Generate Recipes based on Context + Ingredients + Filters
export const generateRecipes = async (
  ingredients: Ingredient[],
  userPrefs: UserPreferences,
  vibe: string,
  filters: FilterState
): Promise<Recipe[]> => {
  try {
    const ingredientList = ingredients.map(i => i.name).join(", ");
    const cuisineContext = filters.cuisine ? `Specific Cuisine Request: ${filters.cuisine}` : 'Cuisine: Open to suggestions based on location and ingredients';
    
    const prompt = `
      You are ForkIt, an intelligent cooking assistant.
      User Context:
      - Location: ${userPrefs.city}
      - Motivation: ${userPrefs.motivation}
      - Cooking Level: ${userPrefs.cookingLevel}
      - Current Vibe/Craving: ${vibe || 'Any'}
      
      Constraints / Filters:
      - Max Time: ${filters.time} minutes
      - Effort Level: ${filters.effort}
      - Meal Type: ${filters.meal}
      - ${cuisineContext}

      Available Ingredients: ${ingredientList}

      Task: Suggest 3-4 EXISTING, REAL recipes from reputable sources.
      
      Reputable Sources to consider: 
      NYT Cooking, Bon Appétit, Serious Eats, BBC Good Food, Just One Cookbook, Food52, 
      Smitten Kitchen, The Woks of Life, Maangchi, RecipeTin Eats, Sally's Baking Addiction, 
      Cookie and Kate, Spend With Pennies.

      CRITICAL RULES:
      1. **Do NOT force the use of all ingredients.** Pick recipes that use the *core* ingredients well. It is better to use 2 ingredients perfectly than 10 ingredients poorly.
      2. **Real Recipes Only.** The 'title' must be the exact name of a real recipe found online. Do not invent recipes.
      3. **Adaptation.** In the 'description', explain specifically *why* this recipe works for the user and how to adapt it (e.g., "Use your [User Ingredient] as a substitute for [Original Ingredient]").
      4. **Search Query.** Provide a 'searchQuery' that will definitely find this specific recipe on Google (e.g. "Smitten Kitchen tomato soup recipe").

      Output JSON format only.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              matchScore: { type: Type.NUMBER, description: "0 to 100 based on ingredient overlap" },
              timeMinutes: { type: Type.NUMBER },
              effort: { type: Type.STRING, enum: ["Minimal", "Moderate", "Involved"] },
              rating: { type: Type.NUMBER },
              reviewCount: { type: Type.NUMBER },
              featuredOn: { type: Type.STRING },
              userSentiment: { type: Type.STRING },
              ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              searchQuery: { type: Type.STRING }
            },
            required: ["id", "title", "description", "matchScore", "rating", "reviewCount", "featuredOn", "ingredients", "searchQuery"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as Recipe[];

  } catch (error) {
    console.error("Gemini Recipe Error:", error);
    return [];
  }
};
