import { Howl } from 'howler';
import type { Card } from '../stores/game';

class AudioService {
  private chime: Howl;
  private currentHowl: Howl | null = null;

  constructor() {
    this.chime = new Howl({
      src: ['assets/audio/chime.mp3'],
      volume: 0.5,
      onloaderror: () => console.warn('Chime audio not found at assets/audio/chime.mp3'),
    });
  }

  /**
   * Play the initial game chime.
   */
  playChime(): Promise<void> {
    return new Promise((resolve) => {
      this.chime.once('end', () => resolve());
      this.chime.once('loaderror', () => resolve());
      this.chime.play();
    });
  }

  /**
   * Generic internal method to play a sound from a path with error handling.
   */
  private playSound(path: string): Promise<void> {
    // Stop any currently playing card audio to prevent overlapping
    if (this.currentHowl) {
      this.currentHowl.stop();
      this.currentHowl.unload();
    }

    return new Promise((resolve) => {
      this.currentHowl = new Howl({
        src: [path],
        html5: true, // Better for larger files and avoids CORS issues in some local setups
        onloaderror: () => {
          console.warn(`Audio file not found or failed to load: ${path}`);
          resolve();
        },
        onplayerror: (_id: number, error: unknown) => {
          console.error(`Playback error for ${path}:`, error);
          resolve();
        }
      });

      this.currentHowl.once('end', () => {
        this.currentHowl = null;
        resolve();
      });

      this.currentHowl.play();
    });
  }

  /**
   * Plays the riddle audio for a specific card.
   */
  async playRiddle(card: Card) {
    await this.playSound(card.audio_riddle);
  }

  /**
   * Plays the answer audio (the card name) for a specific card.
   */
  async playAnswer(card: Card) {
    await this.playSound(card.audio_answer);
  }

  /**
   * Plays the "Rescue" audio for difficult pronunciations.
   */
  async playRescue(card: Card) {
    await this.playSound(card.audio_rescue);
  }

  /**
   * Mode A: Classic Flow (Automated)
   * Sequence: Chime -> Riddle -> 3s Pause -> Answer
   */
  async playClassicSequence(card: Card) {
    await this.playChime();
    await this.playRiddle(card);
    
    // 3000ms dramatic pause as per Design Doc Section 5
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await this.playAnswer(card);
  }

  /**
   * Mode B: Trivia Flow (Action 1)
   * Sequence: Chime -> Riddle
   */
  async playTriviaRiddleSequence(card: Card) {
    await this.playChime();
    await this.playRiddle(card);
  }

  /**
   * Utility to stop all sounds immediately (e.g., on Game Reset or Undo)
   */
  stopAll() {
    if (this.currentHowl) {
      this.currentHowl.stop();
    }
    this.chime.stop();
  }
}

export const audioService = new AudioService();
