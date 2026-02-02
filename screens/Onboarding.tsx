import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { MapPin, ArrowRight, User } from 'lucide-react';

interface Props {
  onComplete: (prefs: UserPreferences) => void;
}

export const Onboarding: React.FC<Props> = ({ onComplete }) => {
  // Defaulting hidden prefs to 'Comfort' and 'Quick Win' to streamline entry
  const [prefs, setPrefs] = useState<UserPreferences>({
    name: '',
    city: '',
    cookingLevel: 'Comfort',
    motivation: 'Quick Win'
  });

  const handleComplete = () => {
    if (prefs.name && prefs.city) {
        onComplete(prefs);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 items-center justify-center max-w-md mx-auto relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-10 -left-10 w-64 h-64 bg-orange-300 rounded-full blur-[100px] opacity-20"></div>
          <div className="absolute bottom-10 -right-10 w-64 h-64 bg-yellow-300 rounded-full blur-[100px] opacity-20"></div>
      </div>

      <div className="w-full flex-1 flex flex-col justify-center animate-fade-in">
            <div className="flex justify-center mb-8">
                <Logo size="lg" />
            </div>
            <div className="text-center space-y-3 mb-10">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Let's get cooking! 🍳</h1>
              <p className="text-slate-500 font-medium text-lg">Your intelligent kitchen assistant is ready. Who are we cooking for?</p>
            </div>
            
            <div className="space-y-5">
              <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-4 mt-2 mb-1">Nickname</label>
                <div className="flex items-center px-4 pb-2">
                    <User className="w-5 h-5 text-orange-500 mr-3" />
                    <input 
                    type="text" 
                    value={prefs.name}
                    onChange={(e) => setPrefs({...prefs, name: e.target.value})}
                    className="w-full py-2 bg-transparent font-bold text-xl text-slate-900 placeholder:text-slate-300 focus:outline-none"
                    placeholder="e.g. Gordon"
                    autoFocus
                    />
                </div>
              </div>
              
              <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-4 mt-2 mb-1">Current City</label>
                <div className="flex items-center px-4 pb-2">
                    <MapPin className="w-5 h-5 text-orange-500 mr-3" />
                    <input 
                        type="text" 
                        value={prefs.city}
                        onChange={(e) => setPrefs({...prefs, city: e.target.value})}
                        className="w-full py-2 bg-transparent font-bold text-xl text-slate-900 placeholder:text-slate-300 focus:outline-none"
                        placeholder="e.g. Tokyo"
                        onKeyDown={(e) => e.key === 'Enter' && handleComplete()}
                    />
                </div>
              </div>
            </div>
      </div>

      <div className="w-full mt-8 mb-8">
        <Button 
          fullWidth 
          onClick={handleComplete}
          disabled={!prefs.name || !prefs.city}
          className="shadow-xl shadow-orange-200 h-14 text-lg"
        >
          Start Cooking <ArrowRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  );
};
