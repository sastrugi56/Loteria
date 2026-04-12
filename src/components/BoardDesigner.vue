<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGameStore } from '../stores/game';
import { Plus, Printer, Download, Trash2, RefreshCw, LayoutGrid } from 'lucide-vue-next';

// Use a lazy getter for the store to ensure Pinia is ready
const getStore = () => useGameStore();
const boards = ref<{ board_id: number; cards: number[] }[]>([]);
const batchSize = ref(10);
const isPrintMode = ref(false);
const isLoaded = ref(false);

// Load existing data
onMounted(async () => {
  console.log('--- BOARD DESIGNER MOUNT START ---');
  try {
    console.log('[Designer] Fetching cards.json...');
    const cardRes = await fetch('assets/cards.json');
    if (!cardRes.ok) throw new Error('Failed to load cards.json');
    const cardData = await cardRes.json();
    console.log('[Designer] cards.json loaded, size:', cardData.length);
    
    const store = getStore();
    store.setDeck(cardData);
    console.log('[Designer] Cards successfully set in Pinia store');

    console.log('[Designer] Fetching boards.json...');
    const boardRes = await fetch('assets/boards.json');
    if (boardRes.ok) {
      boards.value = await boardRes.json();
      console.log(`[Designer] ${boards.value.length} boards loaded into local state`);
    } else {
      console.warn('[Designer] boards.json not found, starting with empty registry');
    }
  } catch (e) {
    console.error('[Designer] CRITICAL INIT ERROR:', e);
  } finally {
    isLoaded.value = true;
    console.log('[Designer] Initialization complete, isLoaded set to true');
    console.log('--- BOARD DESIGNER MOUNT END ---');
  }
});

// Helper to check if a card set already exists in the registry
const isUnique = (newCards: number[]) => {
  const sortedNew = [...newCards].sort((a, b) => a - b).join(',');
  return !boards.value.some(b => 
    [...b.cards].sort((a, b) => a - b).join(',') === sortedNew
  );
};

// Generate a single unique board
const generateUniqueBoard = () => {
  const store = getStore();
  const allIds = store.fullDeck.map(c => c.card_id);
  if (allIds.length < 16) {
    alert('Not enough cards loaded to generate a board.');
    return null;
  }

  let newCards: number[] = [];
  let attempts = 0;
  
  do {
    newCards = [];
    const pool = [...allIds];
    while (newCards.length < 16) {
      const idx = Math.floor(Math.random() * pool.length);
      newCards.push(pool.splice(idx, 1)[0]);
    }
    attempts++;
    if (attempts > 1000) {
      alert('Could not generate a unique board after 1000 attempts.');
      return null;
    }
  } while (!isUnique(newCards));

  const nextId = boards.value.length > 0 
    ? Math.max(...boards.value.map(b => b.board_id)) + 1 
    : 1;

  return { board_id: nextId, cards: newCards };
};

const addBatch = () => {
  for (let i = 0; i < batchSize.value; i++) {
    const board = generateUniqueBoard();
    if (board) boards.value.push(board);
  }
};

const deleteBoard = (id: number) => {
  if (confirm(`Delete Board #${id} from the registry?`)) {
    boards.value = boards.value.filter(b => b.board_id !== id);
  }
};

const downloadJSON = () => {
  const data = JSON.stringify(boards.value, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'boards.json';
  a.click();
};

const printBoards = () => {
  isPrintMode.value = true;
  setTimeout(() => {
    window.print();
    isPrintMode.value = false;
  }, 500);
};

const getCard = (id: number) => {
  const store = getStore();
  return store.fullDeck.find(c => c.card_id === id);
};
</script>

<template>
  <div v-if="isLoaded" :class="['min-h-screen font-sans', isPrintMode ? 'bg-white p-0' : 'bg-slate-100 p-8']">
    
    <!-- UI Header (Hidden in Print) -->
    <header v-if="!isPrintMode" class="max-w-6xl mx-auto flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border">
      <!-- ... (Header content remains the same) -->
      <div>
        <h1 class="text-3xl font-black text-slate-800 flex items-center gap-3">
          <LayoutGrid :size="32" class="text-indigo-600" />
          Board Designer & Registry
        </h1>
        <p class="text-slate-500 font-medium">Manage unique Lotería boards (Current: {{ boards.length }})</p>
      </div>

      <div class="flex gap-3">
        <div class="flex bg-slate-100 rounded-xl p-1 border">
          <input 
            v-model.number="batchSize" 
            type="number" 
            class="w-16 bg-transparent text-center font-bold text-indigo-600 focus:outline-none"
          />
          <button 
            @click="addBatch"
            class="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <Plus :size="18" /> Create Batch
          </button>
        </div>
        
        <button @click="printBoards" class="p-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900 shadow-md">
          <Printer :size="20" />
        </button>
        
        <button @click="downloadJSON" class="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-md" title="Download boards.json">
          <Download :size="20" />
        </button>
      </div>
    </header>

    <!-- Boards List / Print View -->
    <div :class="['max-w-6xl mx-auto', isPrintMode ? 'print-grid' : 'grid grid-cols-1 md:grid-cols-2 gap-8']">
      
      <div 
        v-for="board in boards" 
        :key="board.board_id"
        class="board-container bg-white shadow-xl relative page-break-after"
        :class="[isPrintMode ? 'p-2 border-none w-full h-[10.4in]' : 'p-6 border-4 border-slate-200 mb-8']"
      >
        <!-- Board Header -->
        <div class="flex justify-between items-end mb-2 border-b-8 border-slate-900 pb-1">
          <h2 class="text-6xl font-black text-slate-900 tracking-tighter uppercase">LOTERÍA</h2>
          <div class="text-right">
            <span class="text-xs font-bold text-slate-400 block uppercase tracking-widest">Board ID</span>
            <span class="text-3xl font-black text-indigo-600">#{{ board.board_id.toString().padStart(3, '0') }}</span>
          </div>
        </div>

        <!-- 4x4 Grid - Maximize height -->
        <div class="grid grid-cols-4 gap-2 h-[92%]">
          <div 
            v-for="cardId in board.cards" 
            :key="cardId"
            class="border-4 border-slate-900 flex flex-col items-center justify-center p-1 relative bg-white rounded-xl overflow-hidden shadow-sm"
          >
            <img 
              v-if="getCard(cardId)"
              :src="getCard(cardId)!.image_path" 
              class="w-full h-auto max-h-[88%] object-contain rounded-md"
            />
            <span class="text-xs font-black text-slate-300 absolute top-1 left-2">{{ cardId }}</span>
            <span class="text-xs font-black text-slate-900 uppercase tracking-tighter text-center truncate w-full mt-auto mb-1">
              {{ getCard(cardId)?.name_spanish }}
            </span>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-2 pt-1 flex justify-between items-center opacity-30 border-t-2 border-slate-100">
          <span class="text-[10px] font-black tracking-widest uppercase italic">Digital Inclusive Edition</span>
          <span class="text-[10px] font-black uppercase">Large Print Format</span>
        </div>

        <!-- Delete Button -->
        <button 
          v-if="!isPrintMode"
          @click="deleteBoard(board.board_id)"
          class="absolute -top-4 -right-4 bg-white text-rose-500 border-2 border-rose-100 p-2 rounded-full hover:bg-rose-500 hover:text-white transition-all shadow-lg"
        >
          <Trash2 :size="16" />
        </button>
      </div>

    </div>

    <!-- Empty State ... (same as before) -->
    <div v-if="boards.length === 0 && !isPrintMode" class="max-w-6xl mx-auto bg-white rounded-3xl p-20 text-center border-4 border-dashed border-slate-200">
       <RefreshCw :size="80" class="mx-auto text-slate-200 animate-spin-slow mb-6" />
       <h2 class="text-3xl font-bold text-slate-400">No boards in registry.</h2>
       <p class="text-slate-400 mb-8">Enter a batch size above to generate your first set of unique boards.</p>
       <button @click="addBatch" class="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xl shadow-xl hover:scale-105 transition-transform">
         Generate First Batch
       </button>
    </div>
  </div>
  <div v-else class="h-screen flex items-center justify-center text-slate-400 italic">
    Loading Designer...
  </div>
</template>

<style scoped>
@page {
  size: letter portrait;
  margin: 0.5in; /* Safe printable margin for most printers */
}

@media print {
  .page-break-after {
    page-break-after: always;
    display: block;
    margin: 0 !important;
    padding: 0.2in; /* Extra internal safety padding */
  }
  .print-grid {
    display: block !important;
    width: 100% !important;
  }
  .board-container {
    height: 9.6in !important; /* Adjusted for larger margins */
    box-shadow: none !important;
    border: none !important;
  }
}

.animate-spin-slow {
  animation: spin 8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
