import React, { useState, useEffect } from 'react';
import { Onboarding } from './screens/Onboarding';
import { Dashboard } from './screens/Dashboard';
import { Screen, UserPreferences } from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.ONBOARDING);
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing user
    const savedPrefs = localStorage.getItem('forkit_user_prefs');
    if (savedPrefs) {
      setPrefs(JSON.parse(savedPrefs));
      setCurrentScreen(Screen.DASHBOARD);
    }
    setLoading(false);
  }, []);

  const handleOnboardingComplete = (newPrefs: UserPreferences) => {
    // Save to local storage
    localStorage.setItem('forkit_user_prefs', JSON.stringify(newPrefs));
    setPrefs(newPrefs);
    setCurrentScreen(Screen.DASHBOARD);
  };

  if (loading) return null;

  if (currentScreen === Screen.ONBOARDING) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (currentScreen === Screen.DASHBOARD && prefs) {
    return <Dashboard prefs={prefs} />;
  }

  return null;
}
