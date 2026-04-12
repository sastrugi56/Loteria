import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Card {
  card_id: number;
  image_path: string;
  name_spanish: string;
  name_english: string;
  phonetic_guide: string;
  riddle_spanish: string;
  riddle_english: string;
  audio_riddle: string;
  audio_answer: string;
  audio_rescue: string;
}

export const useGameStore = defineStore('game', () => {
  // State
  const fullDeck = ref<Card[]>([]);
  const availableDeck = ref<Card[]>([]);
  const history = ref<Card[]>([]);
  const currentCard = ref<Card | null>(null);
  const gameMode = ref<'classic' | 'trivia'>('classic');
  const isRevealed = ref(false); // Used for Trivia Mode

  // Getters
  const lastCalledCards = computed(() => history.value.slice(-5).reverse());
  const cardsRemaining = computed(() => availableDeck.value.length);

  // Actions
  function setDeck(cards: Card[]) {
    fullDeck.value = cards;
    resetGame();
  }

  function shuffleDeck() {
    const deck = [...fullDeck.value];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    availableDeck.value = deck;
  }

  function resetGame() {
    history.value = [];
    currentCard.value = null;
    isRevealed.value = false;
    shuffleDeck();
  }

  function drawNext() {
    if (availableDeck.value.length === 0) return null;
    
    if (currentCard.value) {
      history.value.push(currentCard.value);
    }
    
    currentCard.value = availableDeck.value.shift() || null;
    isRevealed.value = gameMode.value === 'classic';
    return currentCard.value;
  }

  function revealCard() {
    isRevealed.value = true;
  }

  function undoLastDraw() {
    if (currentCard.value) {
      availableDeck.value.unshift(currentCard.value);
      currentCard.value = history.value.pop() || null;
      isRevealed.value = true;
    }
  }

  return {
    fullDeck, availableDeck, history, currentCard, gameMode, isRevealed,
    lastCalledCards, cardsRemaining,
    setDeck, resetGame, drawNext, revealCard, undoLastDraw
  };
});
