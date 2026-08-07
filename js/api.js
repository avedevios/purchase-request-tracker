/** @module api — Cloudflare KV fetch/save, WebSocket real-time push, and localStorage fallback sync. */

import { showToast } from './ui/toast.js';

/** @type {import('./types.js').IssueItem[]} Live in-memory dataset — mutated directly by actions. */
export let dataset = [];

/** @type {WebSocket|null} Active WebSocket connection to Cloudflare Worker. */
export let socket = null;

let dbPollInterval = null;
let renderCallback = null;
let chatUpdateCallback = null;

const syncChannel = typeof window !== 'undefined' && window.BroadcastChannel ? new BroadcastChannel('pr_tracker_sync') : null;

/** @param {function} cb — Called after any dataset update to re-render the UI. */
export function setRenderCallback(cb) { renderCallback = cb; }

/** @param {function} cb — Called after dataset update to refresh the open chat thread. */
export function setChatUpdateCallback(cb) { chatUpdateCallback = cb; }

/** @param {import('./types.js').IssueItem[]} newDataset — Replaces the live dataset (used by deleteItem). */
export function setDataset(newDataset) { dataset = newDataset; }

/** Writes dataset to localStorage and notifies other tabs via BroadcastChannel. */
export function broadcastLocalChange() {
  localStorage.setItem('kv_dataset_cache', JSON.stringify(dataset));
  if (syncChannel) syncChannel.postMessage({ type: 'DATASET_UPDATED', dataset: dataset, timestamp: Date.now() });
}

/** Listens for dataset changes from other tabs (BroadcastChannel + storage event). */
export function initSyncListeners() {
  if (syncChannel) {
    syncChannel.onmessage = (event) => {
      if (event.data?.type === 'DATASET_UPDATED') {
        dataset = event.data.dataset;
        renderCallback?.();
        chatUpdateCallback?.();
        showToast('Real-time sync update received from another tab!', '💬');
      }
    };
  }

  window.addEventListener('storage', (e) => {
    if (e.key === 'kv_dataset_cache' && e.newValue) {
      try {
        dataset = JSON.parse(e.newValue);
        renderCallback?.();
        chatUpdateCallback?.();
        showToast('Real-time sync update received!', '💬');
      } catch (err) {}
    }
  });
}

/** Opens a WebSocket to the Cloudflare Worker for <50ms live push. Auto-reconnects on close. */
export function initWebSocketConnection() {
  const workerUrl = localStorage.getItem('worker_url');
  if (!workerUrl) return;

  try {
    let wsUrl = workerUrl.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
    if (!wsUrl.endsWith('/ws')) wsUrl += '/ws';

    socket = new WebSocket(wsUrl);
    socket.onopen = () => console.log('⚡ Connected to Cloudflare Real-Time WebSocket server!');
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'DATASET_UPDATED' && data.dataset) {
          dataset = data.dataset;
          localStorage.setItem('kv_dataset_cache', JSON.stringify(dataset));
          renderCallback?.();
          chatUpdateCallback?.();
          showToast(`💬 Instant update received from ${data.author || 'someone'}!`, '⚡');
        }
      } catch (err) {}
    };
    socket.onclose = () => setTimeout(initWebSocketConnection, 3000);
    socket.onerror = () => { try { socket.close(); } catch(e) {} };
  } catch (e) {}
}

/**
 * Loads data in priority order: Cloudflare KV → localStorage cache → empty array.
 * Calls renderCallback() after loading.
 */
export async function syncFromDatabase() {
  const workerUrl = localStorage.getItem('worker_url');
  if (workerUrl) {
    try {
      const res = await fetch(workerUrl + '?cb=' + Date.now());
      if (res.ok) {
        const json = await res.json();
        dataset = Array.isArray(json) ? json : [];
        localStorage.setItem('kv_dataset_cache', JSON.stringify(dataset));
        renderCallback?.();
        showToast('Synced live data from Cloudflare Database! ⚡', '⚡');
        return;
      }
    } catch (e) {}
  }

  const cached = localStorage.getItem('kv_dataset_cache') || localStorage.getItem('local_dataset');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      dataset = Array.isArray(parsed) ? parsed : [];
      renderCallback?.();
      showToast('Loaded cached dataset!', '💾');
      return;
    } catch (e) {}
  }

  dataset = [];
  renderCallback?.();
  showToast('No database connected. Add your Cloudflare Worker URL via the DB button.', '💡');
}

/** Polls KV for changes and re-renders only if data has changed. */
export async function checkDatabaseForUpdates() {
  const workerUrl = localStorage.getItem('worker_url');
  if (!workerUrl) return;

  try {
    const res = await fetch(workerUrl + '?cb=' + Date.now());
    if (res.ok) {
      let freshData = await res.json();
      freshData = Array.isArray(freshData) ? freshData : [];
      if (JSON.stringify(freshData) !== JSON.stringify(dataset)) {
        dataset = freshData;
        localStorage.setItem('kv_dataset_cache', JSON.stringify(dataset));
        renderCallback?.();
        chatUpdateCallback?.();
        showToast('Real-time database update received!', '⚡');
      }
    }
  } catch (e) {}
}

/** Starts polling Cloudflare KV for updates every 4 seconds. */
export function startDatabasePolling() {
  if (dbPollInterval) clearInterval(dbPollInterval);
  dbPollInterval = setInterval(checkDatabaseForUpdates, 4000);
}

/** @param {string} currentUser @param {import('./types.js').IssueItem|null} activeChatItem */
export function saveChanges(currentUser, activeChatItem) {
  saveToDatabase(currentUser, activeChatItem);
}

/**
 * POSTs dataset to Cloudflare Worker KV. Also pushes via WebSocket if connected.
 * Prompts for Worker URL if not yet configured. Falls back to localStorage on error.
 * @param {string} currentUser @param {import('./types.js').IssueItem|null} activeChatItem
 */
export async function saveToDatabase(currentUser, activeChatItem) {
  const workerUrl = localStorage.getItem('worker_url');
  if (!workerUrl) {
    const newUrl = prompt('Enter your Cloudflare Worker URL to connect to your Database:');
    if (newUrl?.trim()) {
      localStorage.setItem('worker_url', newUrl.trim());
      initWebSocketConnection();
      startDatabasePolling();
      return saveToDatabase(currentUser, activeChatItem);
    } else {
      broadcastLocalChange();
      showToast('Saved to local storage cache.', '💡');
      return;
    }
  }

  if (socket?.readyState === WebSocket.OPEN) {
    try {
      socket.send(JSON.stringify({ type: 'DATASET_UPDATE', dataset, author: currentUser, issue: activeChatItem?.issue }));
    } catch (e) {}
  }

  try {
    const res = await fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataset, author: currentUser, issue: activeChatItem?.issue })
    });

    if (res.ok) {
      broadcastLocalChange();
      showToast('Saved to Cloudflare Database! ⚡', '✅');
    } else {
      const err = await res.json();
      showToast(`Database Error: ${err.error || 'Save failed'}`, '❌');
    }
  } catch (err) {
    broadcastLocalChange();
    showToast(`Database Connection Error: ${err.message}`, '❌');
  }
}
