import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { Ingredient, Recipe, UserPreferences, FilterState } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Safety settings to block harmful content
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
];

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
            text: `Analyze this image of food/fridge. 
                   SAFETY GUARDRAIL: 
                   1. If the image contains nudity, gore, violence, or sexually explicit content, return [{"name": "ERROR_UNSAFE", "category": "other"}].
                   2. If the image contains a living human or pet (dog, cat, etc.) as the main subject, return [{"name": "ERROR_UNSAFE", "category": "other"}].
                   3. If there are no food items, return [].
                   
                   Otherwise, return a JSON array where each item has "name" and "category" (produce, protein, pantry, dairy, other).
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
        },
        safetySettings: safetySettings
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as Ingredient[];
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    // Return unsafe error if it was likely a safety block
    return [{ name: "ERROR_UNSAFE", category: "other" }];
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
      
      CRITICAL SAFETY & JAILBREAK CHECK:
      You are a cooking assistant. You MUST refuse to generate recipes for:
      1. Human beings, body parts, or cannibalism.
      2. Household pets (dogs, cats, goldfish, etc.).
      3. Toxic, poisonous, or non-edible items (bleach, tide pods, nuclear waste, poop).
      4. NSFW, sexually explicit, or violent themes.
      5. Hate speech or illicit drugs.
      
      If any of the above are detected in the 'Available Ingredients' or 'Cuisine' input:
      RETURN A SINGLE JSON OBJECT in the array with:
      - id: "safety-violation"
      - title: "Oh! That's not right."
      - description: "My chef hat spun off! 🎩💨 I can't cook with that. Let's try something more... edible? How about a nice pasta?"
      - matchScore: 0
      - timeMinutes: 0
      - effort: "Minimal"
      - rating: 5.0
      - reviewCount: 0
      - featuredOn: "Safety First"
      - userSentiment: "Better safe than sorry!"
      - ingredients: ["Common Sense"]
      - missingIngredients: []
      - searchQuery: "safe dinner recipes"
      
      OTHERWISE, Suggest 3-4 EXISTING, REAL recipes.
      
      Reputable Sources to consider: 
      NYT Cooking, Bon Appétit, Serious Eats, BBC Good Food, Just One Cookbook, Food52, 
      Smitten Kitchen, The Woks of Life, Maangchi, RecipeTin Eats, Sally's Baking Addiction, 
      Cookie and Kate, Spend With Pennies.

      RULES:
      1. **Do NOT force the use of all ingredients.** Pick recipes that use the *core* ingredients well.
      2. **Real Recipes Only.** The 'title' must be the exact name of a real recipe found online.
      3. **Adaptation.** In the 'description', explain specifically *why* this recipe works.
      4. **Search Query.** Provide a 'searchQuery' to find this recipe.

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
        },
        safetySettings: safetySettings
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as Recipe[];

  } catch (error) {
    console.error("Gemini Recipe Error:", error);
    // Fallback safe error
    return [{
      id: "error",
      title: "Kitchen Hiccup",
      description: "Something went wrong in the kitchen. Let's try again!",
      matchScore: 0,
      timeMinutes: 0,
      effort: "Minimal",
      rating: 0,
      reviewCount: 0,
      ingredients: [],
      missingIngredients: [],
      searchQuery: "easy recipes",
      userSentiment: "Try again later"
    }];
  }
};