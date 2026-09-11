/**
 * MediKiosk Voice Guidance (Text-To-Speech) Utility
 * Browser-native Web Speech API wrapper for low-literacy patient kiosk assistance.
 */

export const TTS = {
  isSupported() {
    try {
      return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
    } catch (e) {
      return false;
    }
  },

  stop() {
    try {
      if (this.isSupported()) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {
      console.warn('TTS stop warning:', e);
    }
  },

  speak(text, lang = 'en') {
    try {
      if (!this.isSupported() || !text) return;

      this.stop();

      const utterance = new SpeechSynthesisUtterance(String(text));

      // Map i18n language codes to BCP 47 language tags
      const langMap = {
        en: 'en-US',
        hi: 'hi-IN',
        mr: 'mr-IN'
      };

      utterance.lang = langMap[lang] || 'en-US';
      utterance.rate = 0.9; // Slightly slower for low-literacy clarity
      utterance.pitch = 1.0;

      // Optional: find best voice match if available
      try {
        const rawVoices = window.speechSynthesis.getVoices();
        const voices = Array.isArray(rawVoices)
          ? rawVoices
          : (rawVoices ? Array.from(rawVoices) : []);

        if (voices.length > 0 && typeof voices.find === 'function') {
          const voiceMatch = voices.find(v => (
            v &&
            typeof v === 'object' &&
            v.lang &&
            (v.lang === utterance.lang || (typeof v.lang.startsWith === 'function' && v.lang.startsWith(lang)))
          ));
          if (voiceMatch) {
            utterance.voice = voiceMatch;
          }
        }
      } catch (voiceErr) {
        console.warn('TTS voice selection warning:', voiceErr);
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS speak warning:', e);
    }
  }
};
