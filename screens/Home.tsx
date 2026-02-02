import React from 'react';
import { UserPreferences } from '../types';
import { Logo } from '../components/Logo';
import { Camera, Search, Coffee, Zap, Moon, Leaf, Sparkles } from 'lucide-react';

interface Props {
  prefs: UserPreferences;
  onScanClick: () => void;
  onVibeSelect: (vibe: string) => void;
}

export const Home: React.FC<Props> = ({ prefs, onScanClick, onVibeSelect }) => {
  const currentTime = new Date().getHours();
  const greeting = currentTime < 12 ? 'Rise & Shine ☀️' : currentTime < 18 ? 'Good Afternoon 🌤️' : 'Evening, Chef 🌙';

  const vibes = [
    { label: 'Comfort Food', icon: '🍲', color: 'bg-orange-100 hover:bg-orange-200 text-orange-800' },
    { label: 'Quick & Easy', icon: '⚡', color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800' },
    { label: 'Healthy-ish', icon: '🥗', color: 'bg-green-100 hover:bg-green-200 text-green-800' },
    { label: 'Spicy Kick', icon: '🌶️', color: 'bg-red-100 hover:bg-red-200 text-red-800' },
  ];

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pt-2">
        <div className="flex flex-col">
          <span className="text-slate-500 font-medium text-sm tracking-wide uppercase">{greeting}</span>
          <div className="flex items-center gap-1 text-slate-900">
            <h1 className="text-3xl font-extrabold tracking-tight">Hey, {prefs.name}! 👋</h1>
          </div>
          <div className="flex items-center gap-1 mt-1 text-sm font-medium text-slate-500">
            <span className="">📍 Cooking in</span>
            <span className="text-orange-500">{prefs.city}</span>
          </div>
        </div>
        <Logo size="sm" />
      </div>

      {/* Main Action - Fridge Scan */}
      <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-slate-900/20 mb-10 relative overflow-hidden group transform transition-all hover:scale-[1.02] active:scale-[0.98]">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500 rounded-full blur-[80px] opacity-30 -mr-10 -mt-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-[60px] opacity-20 -ml-10 -mb-10"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
             <h2 className="text-3xl font-bold leading-tight">Full Fridge,<br/>Empty Head?</h2>
             <span className="text-4xl animate-float">🥦</span>
          </div>
          <p className="text-slate-300 mb-8 font-medium">Snap a pic of your groceries and we'll turn them into dinner magic.</p>
          
          <button 
            onClick={onScanClick}
            className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-orange-50 transition-colors shadow-lg shadow-black/10"
          >
            <Camera className="w-6 h-6 text-orange-500" />
            Scan My Fridge
          </button>
          
          <div className="mt-4 text-center">
             <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
               Or type manually ingredients
             </button>
          </div>
        </div>
      </div>

      {/* Vibe Check Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-500 fill-current" />
            <h3 className="font-bold text-xl text-slate-800">What's the vibe today?</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {vibes.map((vibe) => (
            <button
              key={vibe.label}
              onClick={() => onVibeSelect(vibe.label)}
              className={`${vibe.color} p-5 rounded-3xl flex flex-col items-start justify-between h-28 transition-all active:scale-95 shadow-sm hover:shadow-md border-2 border-transparent hover:border-black/5`}
            >
              <span className="text-3xl mb-2 filter drop-shadow-sm">{vibe.icon}</span>
              <span className="font-bold text-base leading-none">{vibe.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Search Fallback */}
      <div className="mt-auto pb-4">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-300 to-yellow-300 rounded-2xl opacity-30 group-hover:opacity-50 transition duration-200 blur"></div>
          <div className="relative flex items-center bg-white rounded-2xl shadow-sm">
            <Search className="absolute left-4 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="If you have a specific craving, search here!"
              className="w-full bg-transparent py-4 pl-12 pr-4 rounded-2xl border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>
      </div>
    </div>
  );
};