import React, { useRef, useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { identifyIngredientsFromImage } from '../services/geminiService';
import { Analytics } from '../services/analytics';
import { Ingredient } from '../types';
import { ArrowLeft, Check, X, Plus, Camera, Sparkles, AlertTriangle } from 'lucide-react';

interface Props {
  onBack: () => void;
  onIngredientsFound: (ingredients: Ingredient[]) => void;
}

export const FridgeScan: React.FC<Props> = ({ onBack, onIngredientsFound }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [identifiedIngredients, setIdentifiedIngredients] = useState<Ingredient[]>([]);
  const [isUnsafe, setIsUnsafe] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        analyzeImage(base64.split(',')[1]); // Send only base64 data, remove prefix
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64Data: string) => {
    setIsAnalyzing(true);
    setIsUnsafe(false);
    
    const ingredients = await identifyIngredientsFromImage(base64Data);
    
    // Check for safety flag from service
    if (ingredients.length > 0 && ingredients[0].name === "ERROR_UNSAFE") {
        setIsUnsafe(true);
        setIdentifiedIngredients([]);
        Analytics.trackSafetyViolation('image');
        Analytics.trackFridgeScan('unsafe');
    } else {
        setIdentifiedIngredients(ingredients);
        Analytics.trackFridgeScan('success', ingredients.length);
    }
    
    setIsAnalyzing(false);
  };

  const removeIngredient = (index: number) => {
    const newIngredients = [...identifiedIngredients];
    newIngredients.splice(index, 1);
    setIdentifiedIngredients(newIngredients);
  };

  // Trigger file input on mount if no image
  useEffect(() => {
    if (!image && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col max-w-md mx-auto relative">
      <div className="p-6 flex items-center">
        <button onClick={onBack} className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="ml-4 font-bold text-xl tracking-tight">Fridge Scanner</span>
      </div>

      <div className="flex-1 flex flex-col p-4">
        {!image ? (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-[2rem] m-2 bg-slate-900/50">
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Camera className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Tap to Scan</h3>
            <p className="text-slate-400 text-center px-10 mb-8">Take a clear photo of your open fridge or pantry shelf.</p>
            <Button onClick={() => fileInputRef.current?.click()} className="bg-white text-slate-900 hover:bg-slate-200">
              Open Camera
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col relative">
            <div className="relative h-72 w-full rounded-[2rem] overflow-hidden mb-6 bg-black shadow-2xl">
              <img src={image} alt="Fridge" className="w-full h-full object-cover opacity-80" />
              {isAnalyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-10">
                   <div className="relative">
                     <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                     <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
                     </div>
                   </div>
                   <p className="font-bold text-xl mt-6 animate-pulse text-white">Identifying goodies...</p>
                </div>
              )}
            </div>

            {/* ERROR: UNSAFE CONTENT */}
            {!isAnalyzing && isUnsafe && (
                <div className="flex-1 bg-white rounded-t-[2.5rem] text-slate-900 p-8 -mx-4 -mb-4 animate-slide-up shadow-[0_-10px_40px_rgba(0,0,0,0.2)] text-center">
                    <div className="text-6xl mb-6">🫣</div>
                    <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Oh! That's not right.</h3>
                    <p className="text-slate-500 font-medium mb-8">
                        My sensors are blushing! I can't process that image. Let's stick to delicious food, shall we?
                    </p>
                    <Button onClick={() => { setImage(null); setIsUnsafe(false); fileInputRef.current?.click() }} fullWidth className="h-14 text-lg">
                        Try Something Else
                    </Button>
                </div>
            )}

            {/* SUCCESS: INGREDIENTS FOUND */}
            {!isAnalyzing && !isUnsafe && identifiedIngredients.length > 0 && (
              <div className="flex-1 bg-white rounded-t-[2.5rem] text-slate-900 p-8 -mx-4 -mb-4 animate-slide-up shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-extrabold flex items-center gap-2">
                    Found Items <span className="bg-orange-100 text-orange-600 text-sm py-1 px-3 rounded-full">{identifiedIngredients.length}</span>
                  </h3>
                  <button className="text-orange-500 text-sm font-bold flex items-center gap-1 bg-orange-50 px-3 py-2 rounded-full hover:bg-orange-100 transition-colors">
                    <Plus className="w-4 h-4" /> Add Item
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 max-h-[40vh] overflow-y-auto no-scrollbar pb-24 content-start">
                  {identifiedIngredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                       <span className="text-lg">
                           {ing.category === 'produce' ? '🥬' : ing.category === 'protein' ? '🥩' : ing.category === 'dairy' ? '🥛' : '🥫'}
                       </span>
                       <span className="font-bold text-slate-700">{ing.name}</span>
                      <button onClick={() => removeIngredient(idx)} className="ml-1 text-slate-300 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto z-20">
                    <Button fullWidth onClick={() => onIngredientsFound(identifiedIngredients)} className="h-14 text-lg shadow-xl shadow-orange-500/20">
                        Generate Recipes ✨
                    </Button>
                </div>
              </div>
            )}
            
            {/* ERROR: NO FOOD FOUND */}
            {!isAnalyzing && !isUnsafe && identifiedIngredients.length === 0 && image && (
               <div className="text-center mt-12 px-6">
                 <div className="text-6xl mb-4">👻</div>
                 <h3 className="text-xl font-bold mb-2">Ghost Kitchen?</h3>
                 <p className="text-slate-400 mb-8">We couldn't spot any food clearly. Maybe try a better angle?</p>
                 <Button variant="outline" onClick={() => { setImage(null); fileInputRef.current?.click() }} className="border-slate-600 text-white hover:border-white hover:text-white bg-transparent">Try Again</Button>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};