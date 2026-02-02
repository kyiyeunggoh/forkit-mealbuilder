import React, { useState, useRef, useEffect } from 'react';
import { UserPreferences, Ingredient, FilterState, Recipe } from '../types';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { identifyIngredientsFromImage, generateRecipes } from '../services/geminiService';
import { 
  Camera, Search, Plus, X, Sparkles, Clock, BarChart, 
  CheckCircle, Star, Quote, AlertCircle, ChefHat, ExternalLink, Bookmark, Globe, Utensils
} from 'lucide-react';

interface Props {
  prefs: UserPreferences;
}

type Tab = 'discover' | 'saved';

const getRecipeLink = (recipe: Recipe) => {
  // Use the specific AI-generated query if available, otherwise fallback to title + source
  const query = recipe.searchQuery || `${recipe.title} ${recipe.featuredOn || ''} recipe`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
};

const RecipeCard: React.FC<{ 
  recipe: Recipe; 
  isSaved: boolean; 
  onToggleSave: (recipe: Recipe) => void;
}> = ({ recipe, isSaved, onToggleSave }) => {
  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-slate-100 flex flex-col gap-5 relative overflow-hidden group hover:border-orange-200 transition-all">
        {/* Decorative Blob */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>

        {/* Match Score */}
        <div className="absolute top-5 right-5 bg-white/80 backdrop-blur text-green-700 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1 border border-green-100 z-10">
            <CheckCircle className="w-3 h-3" />
            {Math.round(recipe.matchScore)}%
        </div>

        <div className="relative z-10">
            <h3 className="text-2xl font-extrabold text-slate-900 leading-tight mb-2">{recipe.title}</h3>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">{recipe.description}</p>
        </div>

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

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 relative z-10">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center bg-white px-2 py-1 rounded-md shadow-sm">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-slate-900 font-extrabold ml-1.5 text-sm">{recipe.rating}</span>
                    <span className="text-slate-400 text-xs font-medium ml-1">({recipe.reviewCount.toLocaleString()})</span>
                </div>
                {recipe.featuredOn && (
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded-full border border-purple-200">
                        {recipe.featuredOn}
                    </span>
                )}
            </div>
            <div className="flex gap-3">
                <Quote className="w-5 h-5 text-orange-300 flex-shrink-0" />
                <p className="text-sm text-slate-700 italic font-medium">"{recipe.userSentiment}"</p>
            </div>
        </div>
        
        <div className="flex gap-3 mt-2 relative z-10">
            <a 
              href={getRecipeLink(recipe)} 
              target="_blank" 
              rel="noreferrer"
              className="flex-1 bg-slate-900 text-white rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
            >
                View Instructions <ExternalLink className="w-4 h-4" />
            </a>
            <button 
              onClick={() => onToggleSave(recipe)}
              className={`w-12 flex items-center justify-center rounded-xl border-2 transition-all ${
                isSaved 
                ? 'bg-orange-100 border-orange-500 text-orange-500' 
                : 'bg-white border-slate-200 text-slate-400 hover:border-orange-300'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
        </div>
    </div>
  );
};

export const Dashboard: React.FC<Props> = ({ prefs }) => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [vibe, setVibe] = useState<string>('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    time: '30',
    effort: 'minimal',
    meal: 'Dinner',
    cuisine: ''
  });

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [scanningFridge, setScanningFridge] = useState(false);

  // --- Refs ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recipesEndRef = useRef<HTMLDivElement>(null);

  // --- Effects ---
  // Load saved recipes on mount
  useEffect(() => {
    const saved = localStorage.getItem('forkit_saved_recipes');
    if (saved) {
      setSavedRecipes(JSON.parse(saved));
    }
  }, []);

  // --- Handlers ---

  // 1. Ingredients
  const addIngredient = (name: string) => {
    const formatted = name.trim().toLowerCase();
    if (formatted && !ingredients.includes(formatted)) {
      setIngredients(prev => [...prev, formatted]);
    }
    setManualInput('');
  };

  const removeIngredient = (name: string) => {
    setIngredients(prev => prev.filter(i => i !== name));
  };

  const handleManualSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addIngredient(manualInput);
  };

  // 2. Fridge Scan
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScanningFridge(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const found = await identifyIngredientsFromImage(base64);
        
        const names = found.map(i => i.name.toLowerCase());
        setIngredients(prev => [...new Set([...prev, ...names])]);
        setScanningFridge(false);
        // Show the list after scan
        setShowManualInput(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. Generate Recipes
  const handleFindRecipes = async () => {
    if (ingredients.length === 0) {
      alert("Add at least one ingredient!");
      return;
    }
    setLoadingRecipes(true);
    setRecipes([]); // Clear previous
    
    // Map string[] to Ingredient[] for the service
    const ingredientObjects: Ingredient[] = ingredients.map(name => ({ name, category: 'other' }));
    
    const results = await generateRecipes(ingredientObjects, prefs, vibe, filters);
    setRecipes(results);
    setLoadingRecipes(false);

    // Scroll to results
    setTimeout(() => {
        recipesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 4. Saving Recipes
  const toggleSaveRecipe = (recipe: Recipe) => {
    const isSaved = savedRecipes.some(r => r.id === recipe.id);
    let newSaved;
    if (isSaved) {
      newSaved = savedRecipes.filter(r => r.id !== recipe.id);
    } else {
      newSaved = [...savedRecipes, { ...recipe, savedAt: Date.now() }];
    }
    setSavedRecipes(newSaved);
    localStorage.setItem('forkit_saved_recipes', JSON.stringify(newSaved));
  };

  // --- Render Helpers ---
  const pantryStaples = ['Olive Oil', 'Salt', 'Pepper', 'Garlic', 'Onion', 'Soy Sauce', 'Butter', 'Eggs'];

  return (
    <div className="min-h-screen pb-24">
      
      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 border-b border-orange-100 shadow-sm">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <Logo size="sm" />
          <div className="flex flex-col items-end">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cooking in</span>
             <span className="text-sm font-bold text-orange-500">{prefs.city}</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6 space-y-8">
        
        {/* --- DISCOVER TAB --- */}
        {activeTab === 'discover' && (
          <>
            {/* HERO: FULL FRIDGE CARD */}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500 rounded-full blur-[80px] opacity-30 -mr-10 -mt-10 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-[60px] opacity-20 -ml-10 -mb-10"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-3xl font-bold leading-tight">Full Fridge,<br/>Empty Head?</h2>
                        <span className="text-4xl animate-float">🥦</span>
                    </div>
                    <p className="text-slate-300 mb-8 font-medium">Snap a pic of your groceries and we'll turn them into dinner magic.</p>
                    
                    {/* Hidden Input for Camera */}
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={scanningFridge}
                        className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-orange-50 transition-colors shadow-lg shadow-black/10 active:scale-95"
                    >
                        {scanningFridge ? (
                             <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                             <Camera className="w-6 h-6 text-orange-500" />
                        )}
                        {scanningFridge ? 'Analyzing...' : 'Scan My Fridge'}
                    </button>
                    
                    <div className="mt-4 text-center">
                        <button 
                            onClick={() => setShowManualInput(!showManualInput)}
                            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                        >
                            Or type manually ingredients
                        </button>
                    </div>
                </div>
            </div>

            {/* MANUAL INPUT SECTION (Collapsible) */}
            {(showManualInput || ingredients.length > 0) && (
                <div className="animate-fade-in bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                     <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input 
                            type="text"
                            value={manualInput}
                            onChange={(e) => setManualInput(e.target.value)}
                            onKeyDown={handleManualSubmit}
                            placeholder="Type ingredient & hit Enter..."
                            className="w-full bg-slate-50 py-3 pl-12 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                        />
                    </div>
                    
                    {/* Chips */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {ingredients.map(ing => (
                            <span key={ing} className="bg-slate-800 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 animate-scale-in">
                                {ing}
                                <button onClick={() => removeIngredient(ing)} className="hover:text-red-300"><X className="w-3 h-3" /></button>
                            </span>
                        ))}
                    </div>

                    {/* Pantry Staples */}
                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Quick Add Staples</span>
                        <div className="flex flex-wrap gap-2">
                            {pantryStaples.map(staple => (
                                <button 
                                    key={staple}
                                    onClick={() => addIngredient(staple)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                                        ingredients.includes(staple.toLowerCase()) 
                                        ? 'bg-orange-100 border-orange-300 text-orange-700' 
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300'
                                    }`}
                                >
                                    {staple}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* VIBE CHECK */}
            <section className="animate-fade-in">
                <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500 fill-current" />
                    What's the vibe?
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: 'Comforting', icon: '🍲', color: 'bg-orange-50 border-orange-200 text-orange-800' },
                        { id: 'Light & Fresh', icon: '🥗', color: 'bg-green-50 border-green-200 text-green-800' },
                        { id: 'Spicy', icon: '🌶️', color: 'bg-red-50 border-red-200 text-red-800' },
                        { id: 'Quick Win', icon: '⚡', color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setVibe(item.id)}
                            className={`p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                                vibe === item.id 
                                ? 'border-orange-500 bg-orange-100 shadow-md scale-[1.02]' 
                                : 'border-transparent bg-white shadow-sm hover:border-slate-200'
                            }`}
                        >
                            <span className="text-2xl">{item.icon}</span>
                            <span className="font-bold text-sm">{item.id}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* FILTERS */}
            <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Constraints
                </h2>
                <div className="space-y-4">
                    {/* Meal Type */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block flex items-center gap-1">
                            <Utensils className="w-3 h-3" /> Meal Type
                        </label>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'].map(m => (
                                <button
                                    key={m}
                                    onClick={() => setFilters({...filters, meal: m})}
                                    className={`px-4 py-2 rounded-full font-bold text-sm border whitespace-nowrap transition-colors ${
                                        filters.meal === m 
                                        ? 'bg-slate-900 text-white border-slate-900' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'
                                    }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Time</label>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {['10', '20', '30', '60'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setFilters({...filters, time: t})}
                                    className={`px-4 py-2 rounded-full font-bold text-sm border whitespace-nowrap ${
                                        filters.time === t ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'
                                    }`}
                                >
                                    {t} min
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Effort */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Effort</label>
                        <div className="flex gap-2">
                            {['minimal', 'moderate', 'involved'].map(e => (
                                <button
                                    key={e}
                                    onClick={() => setFilters({...filters, effort: e})}
                                    className={`px-4 py-2 rounded-full font-bold text-sm border capitalize ${
                                        filters.effort === e ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'
                                    }`}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>
                     {/* Specific Cuisine (Optional) */}
                     <div className="pt-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block flex items-center gap-1">
                             <Globe className="w-3 h-3" /> Specific Cuisine? (Optional)
                        </label>
                        <input 
                            type="text"
                            placeholder="e.g. Italian, Thai, Mexican..."
                            value={filters.cuisine || ''}
                            onChange={(e) => setFilters({...filters, cuisine: e.target.value})}
                            className="w-full bg-slate-50 py-2 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium"
                        />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <div className="pt-2 sticky bottom-6 z-20">
                <Button 
                    fullWidth 
                    onClick={handleFindRecipes} 
                    disabled={loadingRecipes}
                    className="h-14 text-lg shadow-xl shadow-orange-500/20"
                >
                    {loadingRecipes ? 'Creating Magic...' : 'Find My Perfect Recipe 🎯'}
                </Button>
            </div>

            {/* RESULTS */}
            <div ref={recipesEndRef}>
                {recipes.length > 0 && (
                    <section className="animate-slide-up pt-4 space-y-6">
                        <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                            <ChefHat className="w-6 h-6 text-orange-500" />
                            Top Picks
                        </h2>
                        {recipes.map((recipe) => (
                            <RecipeCard 
                                key={recipe.id} 
                                recipe={recipe} 
                                isSaved={savedRecipes.some(r => r.id === recipe.id)}
                                onToggleSave={toggleSaveRecipe}
                            />
                        ))}
                    </section>
                )}
            </div>
          </>
        )}

        {/* --- SAVED TAB --- */}
        {activeTab === 'saved' && (
          <section className="animate-fade-in pt-4 space-y-6 min-h-[60vh]">
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Bookmark className="w-6 h-6 text-orange-500 fill-current" />
                  Saved Recipes
              </h2>
              {savedRecipes.length === 0 ? (
                <div className="text-center py-20 opacity-50">
                   <div className="text-6xl mb-4">📚</div>
                   <p className="font-bold text-lg">Your cookbook is empty</p>
                   <p className="text-sm">Save recipes you love to find them here.</p>
                </div>
              ) : (
                savedRecipes.map((recipe) => (
                    <RecipeCard 
                        key={recipe.id} 
                        recipe={recipe} 
                        isSaved={savedRecipes.some(r => r.id === recipe.id)}
                        onToggleSave={toggleSaveRecipe}
                    />
                ))
              )}
          </section>
        )}

      </div>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-3 px-6 flex justify-around items-center z-30 max-w-md mx-auto text-xs font-bold">
        <button 
          onClick={() => setActiveTab('discover')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'discover' ? 'text-orange-500' : 'text-slate-400 hover:text-slate-600'}`}
        >
            <Sparkles className={`w-6 h-6 ${activeTab === 'discover' ? 'fill-current' : ''}`} />
            <span>Discover</span>
        </button>
        <button 
          onClick={() => setActiveTab('saved')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'saved' ? 'text-orange-500' : 'text-slate-400 hover:text-slate-600'}`}
        >
            <Bookmark className={`w-6 h-6 ${activeTab === 'saved' ? 'fill-current' : ''}`} />
            <span>Saved</span>
        </button>
      </div>

    </div>
  );
};
