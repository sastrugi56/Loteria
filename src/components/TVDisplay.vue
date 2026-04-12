<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';
import { useGameStore, type Card } from '../stores/game';
import { broadcastService } from '../services/broadcast';
import gsap from 'gsap';

const store = useGameStore();
const mainCardRef = ref<HTMLElement | null>(null);
const historyListRef = ref<HTMLElement | null>(null);
const ghostCardRef = ref<HTMLElement | null>(null);

// Local state to manage the "Ghost" card used for the transition animation
const transitioningCard = ref<Card | null>(null);

// Watch for card changes to trigger GSAP animations
watch(() => store.currentCard, async (newCard, oldCard) => {
  if (!newCard) return;

  // 1. Prepare for transition
  transitioningCard.value = oldCard;
  
  await nextTick();

  if (oldCard && ghostCardRef.value && historyListRef.value) {
    const mainRect = mainCardRef.value?.getBoundingClientRect();
    const targetSlot = historyListRef.value.firstElementChild as HTMLElement;
    
    if (mainRect && targetSlot) {
      const targetRect = targetSlot.getBoundingClientRect();
      
      // Calculate translation
      const dX = targetRect.left - mainRect.left;
      const dY = targetRect.top - mainRect.top;
      const scale = targetRect.width / mainRect.width;

      const tl = gsap.timeline();

      // "Shrink and Move" Animation
      tl.to(ghostCardRef.value, {
        x: dX,
        y: dY,
        scale: scale,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          transitioningCard.value = null;
        }
      });

      // Shift existing sidebar items down
      gsap.fromTo(".history-item", 
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, delay: 0.3 }
      );
    }
  }

  // 2. Animate new card scaling up in the center
  gsap.fromTo(".main-stage-content", 
    { scale: 0.8, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)", delay: 0.2 }
  );
});

// Sync state on load
onMounted(() => {
  broadcastService.requestSync();
});
</script>

<template>
  <div class="h-screen w-screen bg-white overflow-hidden flex font-sans select-none">
    <!-- Left Zone: Main Stage (70%) -->
    <main ref="mainCardRef" class="w-[70%] h-full flex flex-col items-center justify-center p-12 border-r-4 border-slate-100 relative">
      <div v-if="store.currentCard" class="main-stage-content w-full flex flex-col items-center">
        <!-- Card Frame -->
        <div class="relative bg-white p-6 rounded-[2rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.15)] border-8 border-slate-50">
          <div v-if="store.isRevealed" class="flex flex-col items-center">
             <img 
              :src="store.currentCard.image_path" 
              class="h-[60vh] w-auto rounded-xl object-contain"
            />
            <!-- Large Card Number Badge -->
            <div class="absolute -top-10 -left-10 bg-indigo-600 text-white w-24 h-24 rounded-3xl flex items-center justify-center font-black text-5xl shadow-2xl border-4 border-white rotate-[-10deg]">
              {{ store.currentCard.card_id }}
            </div>
          </div>
          
          <!-- Trivia Mode: Question Mark Placeholder -->
          <div v-else class="h-[60vh] aspect-[2/3] bg-slate-100 rounded-xl flex items-center justify-center border-4 border-dashed border-slate-300">
             <span class="text-[12rem] font-black text-slate-300">?</span>
             <div class="absolute -top-10 -left-10 bg-slate-400 text-white w-24 h-24 rounded-3xl flex items-center justify-center font-black text-5xl shadow-2xl border-4 border-white rotate-[-10deg]">
              {{ store.currentCard.card_id }}
            </div>
          </div>
        </div>

        <!-- Bilingual Titles & Riddles -->
        <div class="mt-12 text-center max-w-4xl space-y-6">
          <div v-if="store.isRevealed" class="space-y-2">
            <h1 class="text-8xl font-black text-slate-900 tracking-tighter uppercase">{{ store.currentCard.name_spanish }}</h1>
            <p class="text-4xl font-bold text-indigo-500 uppercase tracking-widest">{{ store.currentCard.name_english }}</p>
          </div>
          
          <!-- Riddle Text -->
          <div class="bg-indigo-50 p-8 rounded-3xl border-4 border-indigo-100 mt-6 shadow-inner">
            <p class="text-3xl text-slate-800 font-medium italic leading-tight">
              "{{ store.gameMode === 'trivia' && !store.isRevealed ? store.currentCard.riddle_english : store.currentCard.riddle_spanish }}"
            </p>
          </div>
        </div>
      </div>

      <!-- Ghost Card for Animation -->
      <div 
        v-if="transitioningCard" 
        ref="ghostCardRef"
        class="absolute z-50 pointer-events-none"
      >
        <div class="bg-white p-4 rounded-2xl shadow-xl border-4 border-slate-50">
          <img :src="transitioningCard.image_path" class="h-[60vh] w-auto rounded-lg" />
        </div>
      </div>

      <!-- Welcome State -->
      <div v-if="!store.currentCard" class="text-center space-y-8">
        <div class="w-48 h-48 bg-indigo-600 rounded-full mx-auto flex items-center justify-center text-white text-8xl font-black shadow-2xl animate-bounce">
          L
        </div>
        <h1 class="text-7xl font-black text-slate-900">LOTERÍA</h1>
        <p class="text-3xl text-slate-400 font-medium uppercase tracking-widest">Waiting for the first card...</p>
      </div>
    </main>

    <!-- Right Zone: History Sidebar (30%) -->
    <aside class="w-[30%] bg-slate-50 h-full flex flex-col p-8">
      <h2 class="text-3xl font-black text-slate-400 mb-8 uppercase tracking-tighter flex justify-between">
        History 
        <span class="text-indigo-600">{{ store.history.length }}</span>
      </h2>

      <div ref="historyListRef" class="flex-1 space-y-6 overflow-hidden">
        <div 
          v-for="card in store.lastCalledCards" 
          :key="card.card_id"
          class="history-item bg-white p-4 rounded-3xl shadow-md border-2 border-slate-100 flex items-center gap-6"
        >
          <div class="relative">
            <img :src="card.image_path" class="w-24 h-32 rounded-xl object-cover shadow-sm" />
            <div class="absolute -top-2 -left-2 bg-slate-800 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border-2 border-white">
              {{ card.card_id }}
            </div>
          </div>
          <div class="flex-1">
            <p class="text-2xl font-black text-slate-800 leading-none mb-1 uppercase">{{ card.name_spanish }}</p>
            <p class="text-lg font-bold text-indigo-400 uppercase tracking-wider">{{ card.name_english }}</p>
          </div>
        </div>
      </div>

      <!-- Footer Branding -->
      <div class="mt-auto pt-8 border-t-2 border-slate-200 opacity-30 text-center font-black text-2xl tracking-tighter text-slate-400">
        DIGITAL LOTERÍA DISPLAY
      </div>
    </aside>
  </div>
</template>

<style scoped>
.main-stage-content {
  will-change: transform, opacity;
}
.history-item {
  will-change: transform, opacity;
}
</style>
