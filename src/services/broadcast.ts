import { toRaw } from 'vue';
import { useGameStore } from '../stores/game';

const CHANNEL_NAME = 'loteria_game_bus';

export class BroadcastService {
  private channel: BroadcastChannel;

  constructor() {
    this.channel = new BroadcastChannel(CHANNEL_NAME);
    this.setupListener();
  }

  private get store() {
    return useGameStore();
  }

  private setupListener() {
    this.channel.onmessage = (event) => {
      const { type, payload } = event.data;
      console.log(`[Broadcast] Received: ${type}`, payload);

      switch (type) {
        case 'REQUEST_SYNC':
          // Existing window (usually Operator) responds with current state
          if (this.store.fullDeck.length > 0) {
            console.log('[Broadcast] Responding to sync request');
            this.syncFullState();
          }
          break;
        case 'SYNC_STATE':
          console.log('[Broadcast] Applying state sync');
          this.store.$patch(payload);
          break;
      }
    };
  }

  requestSync() {
    console.log('[Broadcast] Sending sync request');
    this.channel.postMessage({ type: 'REQUEST_SYNC' });
  }

  syncFullState() {
    const state = this.store;
    
    // Explicitly pick only the raw data properties to avoid circular references from computed getters
    const payload = {
      fullDeck: JSON.parse(JSON.stringify(toRaw(state.fullDeck))),
      availableDeck: JSON.parse(JSON.stringify(toRaw(state.availableDeck))),
      history: JSON.parse(JSON.stringify(toRaw(state.history))),
      currentCard: JSON.parse(JSON.stringify(toRaw(state.currentCard))),
      gameMode: state.gameMode,
      isRevealed: state.isRevealed
    };

    this.channel.postMessage({ 
      type: 'SYNC_STATE', 
      payload 
    });
  }
}

export const broadcastService = new BroadcastService();
