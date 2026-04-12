<script setup lang="ts">
import { HelpCircle, ChevronLeft, BookOpen, Monitor, LayoutGrid, AlertCircle, Heart, Save, Box } from 'lucide-vue-next';

const closeManual = () => {
  // Return to the operator view
  const url = new URL(window.location.href);
  url.searchParams.delete('view');
  window.location.href = url.toString();
};
</script>

<template>
  <div class="min-h-screen bg-white font-sans text-slate-800 pb-20">
    <!-- Header -->
    <header class="sticky top-0 bg-white/80 backdrop-blur-md border-b px-8 py-4 flex justify-between items-center z-10 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="bg-indigo-600 p-2 rounded-xl text-white">
          <BookOpen :size="24" />
        </div>
        <h1 class="text-2xl font-black tracking-tight uppercase">User Manual</h1>
      </div>
      <button 
        @click="closeManual"
        class="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors bg-slate-50 px-4 py-2 rounded-xl border"
      >
        <ChevronLeft :size="20" />
        Back to Game
      </button>
    </header>

    <main class="max-w-4xl mx-auto mt-12 px-6 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <!-- Quick Start -->
      <section>
        <h2 class="text-3xl font-black mb-6 flex items-center gap-3 text-indigo-600">
          <Monitor :size="32" /> 1. Running the Game
        </h2>
        <div class="bg-slate-50 p-8 rounded-3xl border-2 border-slate-100 space-y-4 text-lg leading-relaxed">
          <p><strong>Step 1:</strong> Launch the app and click <span class="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Launch TV Display</span>.</p>
          <p><strong>Step 2:</strong> Drag the new window to your second screen or projector. Press <kbd class="bg-white border-2 border-slate-200 px-2 py-1 rounded shadow-sm text-sm font-mono font-bold">F11</kbd> to go fullscreen.</p>
          <p><strong>Step 3:</strong> Use the large <span class="text-indigo-600 font-black uppercase">Draw</span> button to call cards. The TV will automatically sync and play animations.</p>
        </div>
      </section>

      <!-- Game Modes -->
      <section class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="border-4 border-indigo-50 p-8 rounded-[2.5rem] bg-indigo-50/30">
          <h3 class="text-xl font-black mb-4 uppercase tracking-tighter text-indigo-700 underline decoration-4 underline-offset-8">Classic Mode</h3>
          <p class="text-slate-600 leading-relaxed italic text-lg">
            Automated and traditional. One click plays the chime, the riddle, and the answer with a 3-second dramatic pause. Ideal for standard play.
          </p>
        </div>
        <div class="border-4 border-emerald-50 p-8 rounded-[2.5rem] bg-emerald-50/30">
          <h3 class="text-xl font-black mb-4 uppercase tracking-tighter text-emerald-700 underline decoration-4 underline-offset-8">Trivia Mode</h3>
          <p class="text-slate-600 leading-relaxed italic text-lg">
            Interactive play. Click "Play Riddle" first. The card stays hidden on the TV until you click "Reveal" after players guess.
          </p>
        </div>
      </section>

      <!-- Board Designer -->
      <section>
        <h2 class="text-3xl font-black mb-6 flex items-center gap-3 text-indigo-600">
          <LayoutGrid :size="32" /> 2. Managing Boards
        </h2>
        <div class="space-y-6 text-lg text-slate-600 leading-relaxed">
          <p>Click <span class="font-bold text-slate-800 underline">Manage Boards</span> to enter the registry. You can generate batches of 100% unique boards that never repeat.</p>
          
          <div class="bg-amber-50 border-4 border-amber-100 p-8 rounded-[2.5rem]">
            <p class="text-amber-900 font-black mb-3 flex items-center gap-2 text-xl uppercase tracking-tighter">
              <AlertCircle :size="24" /> CRITICAL: Saving Your Registry
            </p>
            <p class="text-amber-800 font-medium">
              After creating or deleting boards, you <strong>must</strong> click the <span class="text-emerald-600 font-bold">Download (Disk) icon</span>. Save that file into your project folder at <code>public/assets/boards.json</code>. If you don't do this, the Win Validator won't know about your new boards!
            </p>
          </div>
        </div>
      </section>

      <!-- Win Validator -->
      <section>
        <h2 class="text-3xl font-black mb-6 flex items-center gap-3 text-indigo-600">
          <HelpCircle :size="32" /> 3. Checking for Winners
        </h2>
        <p class="text-lg text-slate-600 mb-6">
          When a player shouts <strong>"¡LOTERÍA!"</strong>, ask them for their <strong>Board ID</strong> (the number # printed at the top-right of their card).
        </p>
        <div class="flex items-center gap-6 bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl">
          <div class="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center font-black text-4xl shadow-inner">#</div>
          <p class="text-2xl font-medium leading-tight">Type the number into the <span class="text-indigo-400 font-black">Win Validator</span> and hit enter. <span class="text-emerald-400">Green</span> means Win!</p>
        </div>
      </section>

      <!-- Data Backup -->
      <section>
        <h2 class="text-3xl font-black mb-6 flex items-center gap-3 text-indigo-600">
          <Save :size="32" /> 4. Data Protection & Backups
        </h2>
        <div class="space-y-6 text-lg text-slate-600 leading-relaxed">
          <p>Since your boards and card data are stored locally on this computer, it is <strong>highly recommended</strong> to keep a backup on a USB drive or cloud storage.</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100">
              <h4 class="font-black text-slate-900 uppercase tracking-tighter mb-2 underline">Files to Copy</h4>
              <ul class="list-disc list-inside space-y-1 text-base font-mono">
                <li>assets/boards.json</li>
                <li>assets/cards.json</li>
                <li>The entire assets/ folder</li>
              </ul>
            </div>
            <div class="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100">
              <h4 class="font-black text-slate-900 uppercase tracking-tighter mb-2 underline">Why Backup?</h4>
              <p class="text-base italic leading-relaxed text-slate-500">
                If your computer fails, having these files ensures your <strong>printed physical boards</strong> will still work perfectly with the app on a new system.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Production Deployment -->
      <section>
        <h2 class="text-3xl font-black mb-6 flex items-center gap-3 text-indigo-600">
          <Box :size="32" /> 5. Production Deployment
        </h2>
        <div class="space-y-6 text-lg text-slate-600 leading-relaxed text-slate-600">
          <p>To run the app without your source code (for better security and speed), you can create a <strong>Production Build</strong>.</p>
          
          <div class="bg-indigo-900 text-indigo-100 p-8 rounded-[2.5rem] shadow-2xl space-y-4 font-medium">
            <p>1. Run <code>npm run build</code> in your terminal.</p>
            <p>2. Locate the new <code>dist/</code> folder. This folder is your <strong>entire app</strong>.</p>
            <p>3. Copy only <code>dist/</code> to any computer and run it using a simple server like <code>npx serve -s .</code></p>
          </div>
        </div>
      </section>

      <!-- Best Practices -->
      <footer class="pt-16 border-t-4 border-slate-50 text-center space-y-6 pb-10">
        <div class="flex justify-center gap-2 text-rose-500 animate-pulse">
          <Heart :size="40" fill="currentColor" />
        </div>
        <h3 class="text-3xl font-black uppercase tracking-tighter text-slate-900">Designed for Inclusive Play</h3>
        <p class="max-w-xl mx-auto text-slate-500 italic text-lg leading-relaxed">
          The visual aids and bilingual support are built to ensure everyone—regardless of age, sight, or language—can participate in the joy of Lotería.
        </p>
      </footer>

    </main>
  </div>
</template>
