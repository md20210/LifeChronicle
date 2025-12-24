/**
 * Text-to-Speech Service (Browser-based, local)
 */

class TextToSpeechService {
  private synth: SpeechSynthesis;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  /**
   * Speak text using browser TTS
   */
  speak(text: string, lang: string = 'de-DE'): void {
    // Stop any ongoing speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume

    this.synth.speak(utterance);
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
  }

  /**
   * Pause current speech
   */
  pause(): void {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synth.speaking;
  }

  /**
   * Get available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices();
  }
}

export const ttsService = new TextToSpeechService();
