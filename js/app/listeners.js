import { SVG_FOLD_ALL, SVG_UNFOLD_ALL } from '../config.js';
import { dataset, syncFromDatabase, initWebSocketConnection, saveChanges } from '../api.js';
import { getItemCategoryInfo } from '../components.js';
import { applyUserTheme, toggleTheme } from '../ui/theme.js';
import { showToast } from '../ui/toast.js';
import { postNewChatMessage } from '../ui/modal.js';
import { initStatCardEvents } from '../views/stats.js';
import { collapsedLevel1, collapsedLevel2 } from '../views/table.js';

export function initGlobalListeners(
  getCurrentUser, setCurrentUser,
  getCurrentFilter, setCurrentFilter,
  getFilteredData, render, isLiveEnvironment
) {
  // 1. User Switcher (ANTON / ADONIS)
  const userButtons = document.querySelectorAll('.user-switcher-group .user-btn');
  userButtons.forEach(btn => {
    const btnUser = btn.getAttribute('data-user');
    if (btnUser === getCurrentUser()) btn.classList.add('active');
    else btn.classList.remove('active');

    btn.addEventListener('click', (e) => {
      userButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const newUser = btn.getAttribute('data-user');
      setCurrentUser(newUser);
      localStorage.setItem('active_user', newUser);
      applyUserTheme(newUser);
      render();
      showToast(`Switched active user to ${newUser}!`, '👤');
    });
  });

  // 2. Database Sync Settings Button
  const dbSettingsBtn = document.getElementById('dbSettingsBtn');
  if (dbSettingsBtn) {
    dbSettingsBtn.addEventListener('click', (e) => {
      const currentWorker = localStorage.getItem('worker_url') || '';
      const newUrl = prompt('⚡ Cloudflare Worker Database URL:', currentWorker);
      if (newUrl === null) return;

      const trimmed = newUrl.trim();
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        localStorage.setItem('worker_url', trimmed);
        syncFromDatabase();
        initWebSocketConnection();
        showToast('Connected to Cloudflare KV Database & WebSockets!', '⚡');
      } else {
        localStorage.removeItem('worker_url');
        showToast('Database URL cleared.', '💡');
      }
    });
  }

  // 3. Fold / Unfold All Groups Button
  let isAllFolded = false;
  const foldToggleBtn = document.getElementById('foldToggleBtn');
  const foldToggleSvg = document.getElementById('foldToggleSvg');
  if (foldToggleBtn) {
    foldToggleBtn.addEventListener('click', (e) => {
      isAllFolded = !isAllFolded;
      if (isAllFolded) {
        dataset.forEach(item => {
          const { category, subcategory } = getItemCategoryInfo(item);
          collapsedLevel1.add(category);
          if (subcategory) collapsedLevel2.add(`${category} > ${subcategory}`);
        });
        if (foldToggleSvg) foldToggleSvg.innerHTML = SVG_UNFOLD_ALL;
        foldToggleBtn.title = 'Unfold All Groups';
      } else {
        collapsedLevel1.clear();
        collapsedLevel2.clear();
        if (foldToggleSvg) foldToggleSvg.innerHTML = SVG_FOLD_ALL;
        foldToggleBtn.title = 'Fold All Groups';
      }
      render();
    });
  }

  // 4. Stats Summary Cards Filtering
  initStatCardEvents(getCurrentFilter, setCurrentFilter, render);

  // 5. View Switcher (Table View vs Kanban Board View)
  const tableBtn = document.getElementById('tableViewBtn');
  const kanbanBtn = document.getElementById('kanbanViewBtn');
  const tableView = document.getElementById('tableView');
  const kanbanView = document.getElementById('kanbanView');

  if (tableBtn && kanbanBtn) {
    tableBtn.addEventListener('click', (e) => {
      tableBtn.classList.add('active');
      kanbanBtn.classList.remove('active');
      if (tableView) tableView.style.display = 'block';
      if (kanbanView) kanbanView.style.display = 'none';
      if (foldToggleBtn) foldToggleBtn.style.display = 'inline-flex';
    });

    kanbanBtn.addEventListener('click', (e) => {
      kanbanBtn.classList.add('active');
      tableBtn.classList.remove('active');
      if (tableView) tableView.style.display = 'none';
      if (kanbanView) kanbanView.style.display = 'grid';
      if (foldToggleBtn) foldToggleBtn.style.display = 'none';
    });
  }


  // 6. Theme Toggle Button (Light / Dark)
  const themeBtn = document.getElementById('themeToggleBtn');
  const themeToggleSvg = document.getElementById('themeToggleSvg');
  if (themeBtn) {
    themeBtn.addEventListener('click', (e) => {
      toggleTheme(themeToggleSvg, themeBtn);
    });
  }

  // 7. Export JSON Button
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', (e) => {
      const exportObject = getFilteredData();
      const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'purchase_requests.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exported dataset to JSON file!', '📥');
    });
  }

  // 8. Discussion Chat Modal Events
  const chatInput = document.getElementById('chatInput');
  const sendChatBtn = document.getElementById('sendChatBtn');
  const chatThreadContainer = document.getElementById('chatThreadContainer');
  const chatModal = document.getElementById('chatModal');
  const closeChatModalBtn = document.getElementById('closeChatModalBtn');

  if (sendChatBtn) {
    sendChatBtn.addEventListener('click', () => {
      postNewChatMessage(chatInput, getCurrentUser(), chatThreadContainer, render, saveChanges);
    });
  }
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        postNewChatMessage(chatInput, getCurrentUser(), chatThreadContainer, render, saveChanges);
      }
    });
  }

  if (closeChatModalBtn) {
    closeChatModalBtn.addEventListener('click', () => {
      if (chatModal) chatModal.style.display = 'none';
    });
  }

  if (chatModal) {
    chatModal.addEventListener('click', (e) => {
      if (e.target === chatModal) chatModal.style.display = 'none';
    });
  }
}
