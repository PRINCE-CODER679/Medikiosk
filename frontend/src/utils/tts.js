/**
 * MediKiosk Voice Guidance (Text-To-Speech) Utility
 * Browser-native Web Speech API wrapper for low-literacy patient kiosk assistance.
 */

export const TTS = {
  isSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  },

  stop() {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  },

  speak(text, lang = 'en') {
    if (!this.isSupported() || !text) return;

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);

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
    const voices = window.speechSynthesis.getVoices();
    const voiceMatch = voices.find(v => v.lang === utterance.lang || v.lang.startsWith(lang));
    if (voiceMatch) {
      utterance.voice = voiceMatch;
    }

    window.speechSynthesis.speak(utterance);
  }
};
