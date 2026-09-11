import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
  const [textSize, setTextSize] = useState(() => {
    return sessionStorage.getItem('kiosk_textSize') || 'normal';
  });

  const [highContrast, setHighContrast] = useState(() => {
    return sessionStorage.getItem('kiosk_highContrast') === 'true';
  });

  const [voiceGuidance, setVoiceGuidance] = useState(() => {
    return sessionStorage.getItem('kiosk_voiceGuidance') === 'true';
  });

  const [reduceMotion, setReduceMotion] = useState(() => {
    return sessionStorage.getItem('kiosk_reduceMotion') === 'true';
  });

  useEffect(() => {
    sessionStorage.setItem('kiosk_textSize', textSize);
    document.documentElement.setAttribute('data-text-size', textSize);
  }, [textSize]);

  useEffect(() => {
    sessionStorage.setItem('kiosk_highContrast', highContrast.toString());
    document.documentElement.setAttribute('data-high-contrast', highContrast.toString());
  }, [highContrast]);

  useEffect(() => {
    sessionStorage.setItem('kiosk_voiceGuidance', voiceGuidance.toString());
    document.documentElement.setAttribute('data-voice-guidance', voiceGuidance.toString());
  }, [voiceGuidance]);

  useEffect(() => {
    sessionStorage.setItem('kiosk_reduceMotion', reduceMotion.toString());
    document.documentElement.setAttribute('data-reduce-motion', reduceMotion.toString());
  }, [reduceMotion]);

  const updateAccessibility = (updates) => {
    if (updates.textSize !== undefined) setTextSize(updates.textSize);
    if (updates.highContrast !== undefined) setHighContrast(updates.highContrast);
    if (updates.voiceGuidance !== undefined) setVoiceGuidance(updates.voiceGuidance);
    if (updates.reduceMotion !== undefined) setReduceMotion(updates.reduceMotion);
  };

  const getFontSizeClass = () => {
    if (textSize === 'large') return 'text-lg';
    if (textSize === 'xlarge') return 'text-xl';
    return 'text-base';
  };

  return (
    <AccessibilityContext.Provider value={{
      textSize,
      highContrast,
      voiceGuidance,
      reduceMotion,
      updateAccessibility,
      getFontSizeClass
    }}>
      <div className={`transition-all ${highContrast ? 'high-contrast-mode' : ''}`}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
