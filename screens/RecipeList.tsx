import React, { useEffect, useState } from 'react';
import { Ingredient, Recipe, UserPreferences, FilterState } from '../types';
import { generateRecipes } from '../services/geminiService';
import { Button } from '../components/Button';
import { ArrowLeft, Clock, BarChart, Star, CheckCircle, AlertCircle, Quote, Sparkles } from 'lucide-react';
import { Logo } from '../components/Logo';

interface Props {
  ingredients: Ingredient[];
  prefs: UserPreferences;
  vibe: string;
  onBack: () => void;
  filters?: FilterState;
}

export const RecipeList: React.FC<Props> = ({ ingredients, prefs, vibe, onBack, filters }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      // Use provided filters or default values
      const safeFilters: FilterState = filters || {
        time: '30',
        effort: 'moderate',
        meal: 'dinner'
      };
      const results = await generateRecipes(ingredients, prefs, vibe, safeFilters);
      setRecipes(results);
      setLoading(false);
    };
    fetchRecipes();
  }, [ingredients, prefs, vibe, filters]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center">
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-orange-200 blur-3xl rounded-full opacity-50 animate-pulse"></div>
            <Logo size="lg" className="animate-float relative z-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Cooking up magic... ✨</h2>
        <p className="text-slate-500 font-medium text-lg leading-relaxed">
          Comparing your <b>{ingredients.length} ingredients</b> against thousands of tasty "{vibe}" recipes...
        </p>
        <div className="mt-8 flex gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl z-20 p-4 flex items-center justify-between border-b border-slate-100 shadow-sm">
        <button onClick={onBack} className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-50 border border-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex flex-col items-center">
            <span className="font-extrabold text-slate-900 text-lg">Top Picks</span>
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">{vibe} Vibe</span>
        </div>
        <div className="w-11"></div> {/* Spacer */}
      </div>

      <div className="p-6 space-y-6 pb-24">
        {recipes.length === 0 ? (
           <div className="text-center mt-20 px-6">
               <div className="text-6xl mb-4">🤷‍♂️</div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">No perfect matches</h3>
               <p className="text-slate-500 mb-6">We couldn't find a recipe that fits all your criteria nicely. Maybe try loosening the vibe?</p>
               <Button variant="secondary" onClick={onBack} className="bg-slate-200 text-slate-800 hover:bg-slate-300">Adjust Filters</Button>
           </div>
        ) : (
            recipes.map((recipe, idx) => (
            <div key={recipe.id} className="bg-white rounded-[2rem] p-6 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-white hover:border-orange-200 transition-all flex flex-col gap-5 relative overflow-hidden group">
                
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-bl-[100px] -z-0 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>

                {/* Match Score Badge */}
                <div className="absolute top-5 right-5 z-10 bg-white/90 backdrop-blur text-green-700 text-xs font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm border border-green-100">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {Math.round(recipe.matchScore)}% MATCH
                </div>

                {/* Header */}
                <div className="relative z-10 pt-2">
                    <h3 className="text-2xl font-extrabold text-slate-900 leading-tight mb-2 tracking-tight">{recipe.title}</h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{recipe.description}</p>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-4 text-sm font-bold text-slate-600 relative z-10">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg">
                        <Clock className="w-4 h-4 text-orange-500" />
                        {recipe.timeMinutes}m
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg">
                        <BarChart className="w-4 h-4 text-orange-500" />
                        {recipe.effort}
                    </div>
                </div>

                {/* Social Proof Section (The Differentiator) */}
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-4 border border-orange-100/50 relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center bg-white px-2 py-1 rounded-md shadow-sm">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-slate-900 font-extrabold ml-1.5 text-sm">{recipe.rating}</span>
                            <span className="text-slate-300 mx-1">|</span>
                            <span className="text-slate-400 text-xs font-medium">{recipe.reviewCount >= 1000 ? (recipe.reviewCount/1000).toFixed(1) + 'k' : recipe.reviewCount} reviews</span>
                        </div>
                        {recipe.featuredOn && (
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded-full border border-purple-200">
                                ⭐ {recipe.featuredOn}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Quote className="w-6 h-6 text-orange-300 -mt-1 flex-shrink-0" />
                        <p className="text-sm text-slate-700 italic font-medium leading-snug">"{recipe.userSentiment}"</p>
                    </div>
                </div>

                {/* Ingredients Snapshot */}
                <div className="flex flex-wrap gap-2 mt-1 relative z-10">
                    {recipe.missingIngredients.length > 0 && (
                        <div className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-red-100">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Missing: {recipe.missingIngredients[0]} {recipe.missingIngredients.length > 1 ? `+${recipe.missingIngredients.length - 1} more` : ''}
                        </div>
                    )}
                    <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                        {recipe.ingredients.length} ingredients total
                    </div>
                </div>

                <Button fullWidth className="mt-2 text-lg h-14 shadow-lg shadow-orange-200">Let's Cook This! 👨‍🍳</Button>
            </div>
            ))
        )}
      </div>
    </div>
  );
};