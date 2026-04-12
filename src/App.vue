<script setup lang="ts">
import { computed } from 'vue';
import OperatorConsole from './components/OperatorConsole.vue';
import TVDisplay from './components/TVDisplay.vue';
import BoardDesigner from './components/BoardDesigner.vue';
import Manual from './components/Manual.vue';

const view = computed(() => {
  const params = new URLSearchParams(window.location.search);
  return params.get('view') || 'operator';
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900">
    <OperatorConsole v-if="view === 'operator'" />
    <TVDisplay v-else-if="view === 'tv'" />
    <BoardDesigner v-else-if="view === 'designer'" />
    <Manual v-else-if="view === 'help'" />
  </div>
</template>

<style>
/* Base Tailwind utility classes are already imported in style.css */
body {
  margin: 0;
  padding: 0;
}
</style>
