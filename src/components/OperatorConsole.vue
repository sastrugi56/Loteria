<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useGameStore } from '../stores/game';
import { broadcastService } from '../services/broadcast';
import { audioService } from '../services/audio';
import { 
  Play, 
  RotateCcw, 
  ExternalLink, 
  Eye, 
  LifeBuoy, 
  Undo2, 
  CheckCircle2, 
  XCircle,
  LayoutGrid,
  HelpCircle,
  Volume2
} from 'lucide-vue-next';

const store = useGameStore();
const boardIdInput = ref('');
const isProcessing = ref(false);
const isBlackout = ref(false);
const validationResult = ref<{ matches: boolean; missing: number[]; pattern?: string } | null>(null);

// Load cards on mount
onMounted(async () => {
  const response = await fetch('assets/cards.json');
  const cards = await response.json();
  store.setDeck(cards);
  broadcastService.syncFullState();
});

// Primary Actions
const handleDrawNext = async () => {
  if (isProcessing.value) return;
  
  const card = store.drawNext();
  if (card) {
    isProcessing.value = true;
    broadcastService.syncFullState();
    
    if (store.gameMode === 'classic') {
      await audioService.playClassicSequence(card);
    } else {
      await audioService.playTriviaRiddleSequence(card);
    }
    isProcessing.value = false;
  }
};

const handleReveal = async () => {
  if (isProcessing.value || !store.currentCard) return;
  
  isProcessing.value = true;
  store.revealCard();
  broadcastService.syncFullState();
  await audioService.playAnswer(store.currentCard);
  isProcessing.value = false;
};

const handleRescue = () => {
  if (store.currentCard) {
    audioService.playRescue(store.currentCard);
  }
};

const handleReplay = (card: any) => {
  if (card) {
    audioService.playAnswer(card);
  }
};

const handleUndo = () => {
  if (isProcessing.value) return;
  store.undoLastDraw();
  broadcastService.syncFullState();
  audioService.stopAll();
};

const handleReset = () => {
  if (confirm('Start a new game? This will shuffle the deck and clear history.')) {
    store.resetGame();
    broadcastService.syncFullState();
    audioService.stopAll();
    isProcessing.value = false;
    validationResult.value = null;
  }
};

const toggleMode = () => {
  if (isProcessing.value) return;
  const newMode = store.gameMode === 'classic' ? 'trivia' : 'classic';
  store.gameMode = newMode;
  broadcastService.syncFullState();
};

const openTVDisplay = () => {
  window.open('?view=tv', 'LoteriaTV', 'width=1280,height=720');
  setTimeout(() => broadcastService.syncFullState(), 1000);
};

const openBoardDesigner = () => {
  window.open('?view=designer', 'LoteriaDesigner');
};

const openHelp = () => {
  const url = new URL(window.location.href);
  url.searchParams.set('view', 'help');
  window.location.href = url.toString();
};

// Board Validation Logic
const validateBoard = async () => {
  if (!boardIdInput.value) return;
  
  const response = await fetch('assets/boards.json');
  const boards = await response.json();
  const board = boards.find((b: any) => b.board_id === parseInt(boardIdInput.value));
  
  if (board) {
    const calledIds = store.history.map(c => c.card_id);
    if (store.currentCard) calledIds.push(store.currentCard.card_id);
    
    if (isBlackout.value) {
      // Blackout: All 16 cards must match
      const missing = board.cards.filter((id: number) => !calledIds.includes(id));
      validationResult.value = {
        matches: missing.length === 0,
        missing,
        pattern: 'Full Blackout'
      };
    } else {
      // Define standard Lotería Bingo patterns for 4x4 grid
      const gridPatterns = [
        { name: 'Row', indices: [0, 1, 2, 3] },
        { name: 'Row', indices: [4, 5, 6, 7] },
        { name: 'Row', indices: [8, 9, 10, 11] },
        { name: 'Row', indices: [12, 13, 14, 15] },
        { name: 'Column', indices: [0, 4, 8, 12] },
        { name: 'Column', indices: [1, 5, 9, 13] },
        { name: 'Column', indices: [2, 6, 10, 14] },
        { name: 'Column', indices: [3, 7, 11, 15] },
        { name: 'Diagonal', indices: [0, 5, 10, 15] },
        { name: 'Diagonal', indices: [3, 6, 9, 12] },
        { name: '4 Corners', indices: [0, 3, 12, 15] }
      ];

      for (const p of gridPatterns) {
        const patternCardIds = p.indices.map(idx => board.cards[idx]);
        const missingInPattern = patternCardIds.filter(id => !calledIds.includes(id));
        if (missingInPattern.length === 0) {
          validationResult.value = { matches: true, missing: [], pattern: p.name };
          return;
        }
      }
      validationResult.value = { matches: false, missing: [], pattern: 'None Found' };
    }
  } else {
    alert('Board ID not found.');
  }
};
</script>

<template>
  <div class="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans">
    <!-- Header -->
    <header class="bg-white border-b px-6 py-2 flex justify-between items-center shadow-sm">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-bold text-indigo-700">Lotería</h1>
        <div class="flex bg-slate-100 p-1 rounded-lg border">
          <button 
            @click="toggleMode"
            :disabled="isProcessing"
            :class="[
              'px-3 py-1 rounded-md text-xs font-medium transition-all',
              store.gameMode === 'classic' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'
            ]"
          >
            Classic
          </button>
          <button 
            @click="toggleMode"
            :disabled="isProcessing"
            :class="[
              'px-3 py-1 rounded-md text-xs font-medium transition-all',
              store.gameMode === 'trivia' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'
            ]"
          >
            Trivia
          </button>
        </div>
      </div>
      
      <div class="flex gap-2">
        <!-- Help Button -->
        <button 
          @click="openHelp" 
          class="p-2 text-slate-400 hover:text-indigo-600 transition-colors" 
          title="User Manual"
        >
          <HelpCircle :size="20" />
        </button>

        <button @click="handleReset" class="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Reset Game">
          <RotateCcw :size="18" />
        </button>
        
        <button 
          @click="openBoardDesigner" 
          class="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border border-slate-200"
        >
          <LayoutGrid :size="16" />
          Boards
        </button>

        <button 
          @click="openTVDisplay" 
          class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-md active:scale-95"
        >
          <ExternalLink :size="16" />
          TV Display
        </button>
      </div>
    </header>

    <main class="flex flex-1 overflow-hidden p-4 gap-4">
      <!-- Left Column: Teleprompter (60%) -->
      <section class="w-[60%] flex flex-col gap-4">
        <div class="bg-white rounded-2xl shadow-lg border p-6 flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div v-if="store.currentCard" class="w-full flex flex-col items-center overflow-hidden">
            <!-- Card Image - Scaled for smaller heights -->
            <div class="relative group">
              <img 
                :src="store.currentCard.image_path" 
                :alt="store.currentCard.name_spanish"
                class="max-h-[40vh] w-auto rounded-xl shadow-xl border-2 border-slate-100 transform transition-transform group-hover:scale-105"
              />
              <div class="absolute -top-3 -left-3 bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-2 border-white">
                {{ store.currentCard.card_id }}
              </div>
            </div>

            <!-- Card Info - Compact -->
            <div class="mt-4 space-y-1">
              <h2 class="text-4xl font-black tracking-tight text-slate-800 leading-tight">{{ store.currentCard.name_spanish }}</h2>
              <p class="text-xl text-slate-500 font-medium italic min-h-[1.2em]">{{ store.currentCard.phonetic_guide }}</p>
              <p class="text-lg text-indigo-500 font-bold uppercase tracking-widest">{{ store.currentCard.name_english }}</p>
            </div>

            <!-- Riddle - Compact -->
            <div class="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 max-w-lg">
              <p class="text-base text-slate-700 leading-snug italic">"{{ store.currentCard.riddle_spanish }}"</p>
            </div>
          </div>

          <div v-else class="text-slate-300 flex flex-col items-center gap-4">
            <Play :size="80" stroke-width="1" />
            <p class="text-2xl font-light italic">Ready to start the game?</p>
          </div>

          <!-- Rescue Button (Float Right) -->
          <button 
            v-if="store.currentCard"
            @click="handleRescue"
            class="absolute top-8 right-8 p-3 bg-amber-100 text-amber-600 rounded-full hover:bg-amber-200 transition-colors shadow-sm"
            title="Pronunciation Rescue"
          >
            <LifeBuoy :size="24" />
          </button>
        </div>

        <!-- Main Actions -->
        <div class="flex gap-4">
          <button 
            @click="handleDrawNext"
            class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-2xl text-3xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="store.cardsRemaining === 0 || isProcessing"
          >
            <Play v-if="!isProcessing" :size="32" fill="currentColor" />
            <div v-else class="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
            {{ isProcessing ? 'Processing...' : (store.gameMode === 'classic' ? 'Draw Next Card' : 'Play Riddle') }}
          </button>
          
          <button 
            v-if="store.gameMode === 'trivia'"
            @click="handleReveal"
            :disabled="store.isRevealed || !store.currentCard || isProcessing"
            class="w-48 bg-emerald-500 hover:bg-emerald-600 text-white py-6 rounded-2xl text-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
          >
            <Eye :size="28" />
            Reveal
          </button>
        </div>
      </section>

      <!-- Right Column: Management (40%) -->
      <section class="w-[40%] flex flex-col gap-6 overflow-hidden">
        <!-- Card History -->
        <div class="bg-white rounded-2xl shadow-lg border flex-1 flex flex-col overflow-hidden">
          <div class="px-6 py-4 border-b flex justify-between items-center bg-slate-50/50">
            <h3 class="font-bold text-slate-700 flex items-center gap-2">
              <Undo2 :size="18" /> History ({{ store.history.length }})
            </h3>
            <button 
              @click="handleUndo" 
              :disabled="isProcessing || (store.history.length === 0 && !store.currentCard)"
              class="text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-800 disabled:opacity-30 flex items-center gap-1"
            >
              <Undo2 :size="14" /> Undo Last
            </button>
          </div>
          
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div 
              v-for="(card, index) in [...store.history, store.currentCard].filter(Boolean).reverse()" 
              :key="card!.card_id"
              @click="handleReplay(card)"
              :class="[
                'flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer group',
                index === 0 ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100 shadow-sm' : 'bg-white border-slate-100 opacity-60 hover:opacity-100 hover:border-indigo-300 hover:shadow-md'
              ]"
              title="Click to replay card name"
            >
              <img :src="card!.image_path" class="w-12 h-16 rounded shadow-sm object-cover" />
              <div>
                <p class="font-bold text-slate-800">{{ card!.name_spanish }}</p>
                <p class="text-xs text-slate-400">Card #{{ card!.card_id }}</p>
              </div>
              <div class="ml-auto flex items-center gap-2">
                <Volume2 
                  :size="16" 
                  class="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <div v-if="index === 0">
                  <span class="text-[10px] font-black bg-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full uppercase">Current</span>
                </div>
              </div>
            </div>
            
            <div v-if="!store.currentCard && store.history.length === 0" class="h-full flex items-center justify-center text-slate-300 italic py-20">
              No cards called yet.
            </div>
          </div>
        </div>

        <!-- Board Validator -->
        <div class="bg-white rounded-2xl shadow-lg border p-6 space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="font-bold text-slate-700 flex items-center gap-2">
              <CheckCircle2 :size="18" /> Win Validator
            </h3>
            
            <label class="flex items-center gap-2 cursor-pointer group">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-600 transition-colors">Blackout Mode</span>
              <div class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="isBlackout" class="sr-only peer">
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </div>
            </label>
          </div>

          <div class="flex gap-2">
            <input 
              v-model="boardIdInput"
              type="text" 
              placeholder="Enter Board ID (e.g. 12)"
              class="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
              @keyup.enter="validateBoard"
            />
            <button 
              @click="validateBoard"
              class="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-900 transition-all"
            >
              Check
            </button>
          </div>

          <!-- Validation Result Display -->
          <div v-if="validationResult" :class="['p-4 rounded-xl border-2 flex items-center gap-4 transition-all animate-in fade-in zoom-in-95', validationResult.matches ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700']">
            <CheckCircle2 v-if="validationResult.matches" :size="32" />
            <XCircle v-else :size="32" />
            
            <div>
              <p class="font-bold text-lg leading-tight">{{ validationResult.matches ? '¡LOTERÍA!' : 'NOT A WIN' }}</p>
              <p v-if="validationResult.matches && validationResult.pattern" class="text-xs font-black uppercase tracking-widest opacity-70">
                Pattern: {{ validationResult.pattern }}
              </p>
              <p v-if="!validationResult.matches && isBlackout" class="text-sm opacity-80">
                Missing: {{ validationResult.missing.length }} cards
              </p>
              <p v-if="!validationResult.matches && !isBlackout" class="text-sm opacity-80">
                No winning lines found.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
