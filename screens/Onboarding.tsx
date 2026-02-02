import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { MapPin, ChefHat, Heart, ArrowRight, User } from 'lucide-react';

interface Props {
  onComplete: (prefs: UserPreferences) => void;
}

export const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState<UserPreferences>({
    name: '',
    city: '',
    cookingLevel: 'Comfort',
    motivation: 'Quick Win'
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else onComplete(prefs);
  };

  return (
    <div className="min-h-screen flex flex-col p-6 items-center justify-center max-w-md mx-auto relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-10 -left-10 w-64 h-64 bg-orange-300 rounded-full blur-[100px] opacity-20"></div>
          <div className="absolute bottom-10 -right-10 w-64 h-64 bg-yellow-300 rounded-full blur-[100px] opacity-20"></div>
      </div>

      <div className="w-full flex-1 flex flex-col justify-center">
        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex justify-center mb-6">
                <Logo size="lg" />
            </div>
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Let's get cooking! 🍳</h1>
              <p className="text-slate-500 font-medium text-lg">First things first, who are we cooking for?</p>
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
                    />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👨‍🍳</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Your Kitchen Vibe?</h2>
              <p className="text-slate-500 font-medium text-lg">How much chaos can you handle today?</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => setPrefs({...prefs, cookingLevel: 'Comfort'})}
                className={`p-6 rounded-3xl text-left transition-all border-2 group ${prefs.cookingLevel === 'Comfort' ? 'border-orange-500 bg-orange-50 ring-4 ring-orange-100' : 'border-white bg-white hover:border-orange-200 hover:shadow-md'}`}
              >
                <div className="flex justify-between items-center mb-2">
                    <div className="font-extrabold text-xl text-slate-900">Comfort Zone 🏠</div>
                    {prefs.cookingLevel === 'Comfort' && <div className="w-3 h-3 bg-orange-500 rounded-full"></div>}
                </div>
                <div className="text-slate-500 font-medium">I want familiar tastes and zero stress. Keep it simple.</div>
              </button>
              <button 
                onClick={() => setPrefs({...prefs, cookingLevel: 'Adventurous'})}
                className={`p-6 rounded-3xl text-left transition-all border-2 group ${prefs.cookingLevel === 'Adventurous' ? 'border-orange-500 bg-orange-50 ring-4 ring-orange-100' : 'border-white bg-white hover:border-orange-200 hover:shadow-md'}`}
              >
                <div className="flex justify-between items-center mb-2">
                    <div className="font-extrabold text-xl text-slate-900">Adventurous 🌶️</div>
                    {prefs.cookingLevel === 'Adventurous' && <div className="w-3 h-3 bg-orange-500 rounded-full"></div>}
                </div>
                <div className="text-slate-500 font-medium">I'm ready to try new techniques and bold flavors.</div>
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Today's Mission</h2>
              <p className="text-slate-500 font-medium text-lg">What matters most right now?</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                  { id: 'Save Money', icon: '💰' }, 
                  { id: 'Eat Healthy', icon: '🥦' }, 
                  { id: 'Reduce Waste', icon: '♻️' }, 
                  { id: 'Quick Win', icon: '⚡' }
              ].map((m) => (
                <button 
                  key={m.id}
                  onClick={() => setPrefs({...prefs, motivation: m.id as any})}
                  className={`p-4 rounded-3xl flex flex-col items-center justify-center text-center gap-2 aspect-square transition-all border-2 ${prefs.motivation === m.id ? 'border-orange-500 bg-white shadow-lg shadow-orange-200 scale-105' : 'border-transparent bg-white shadow-sm hover:bg-orange-50'}`}
                >
                  <span className="text-3xl">{m.icon}</span>
                  <span className={`font-bold text-sm ${prefs.motivation === m.id ? 'text-orange-600' : 'text-slate-600'}`}>{m.id}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-full mt-8 mb-4">
        <Button 
          fullWidth 
          onClick={handleNext}
          disabled={step === 1 && (!prefs.name || !prefs.city)}
          className="shadow-xl shadow-orange-200"
        >
          {step === 3 ? "Start Cooking!" : "Next Step"} <ArrowRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  );
};