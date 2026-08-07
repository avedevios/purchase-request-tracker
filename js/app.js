import { dataset, syncFromDatabase, initWebSocketConnection, initSyncListeners, setRenderCallback, setChatUpdateCallback } from './api.js';
import { applyUserTheme } from './ui/theme.js';
import { initToastEvents } from './ui/toast.js';
import { activeChatItem, openChatModal, renderChatThread } from './ui/modal.js';
import { updateStats } from './views/stats.js';
import { renderTableView } from './views/table.js';
import { renderKanbanView } from './views/kanban.js';
import { updateItemProperty, setupEditableText, addNewSubcategoryToCategory, addNewItemToCategory, deleteItem } from './app/actions.js';
import { initGlobalListeners } from './app/listeners.js';

const isLiveEnvironment = window.location.hostname.includes('github.io') || 
  (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && window.location.protocol !== 'file:');

let currentUser = localStorage.getItem('active_user') || 'Anton';
let currentFilter = 'ALL';

function getCurrentUser() { return currentUser; }
function setCurrentUser(val) { currentUser = val; }
function getCurrentFilter() { return currentFilter; }
function setCurrentFilter(val) { currentFilter = val; }
function getFilteredData() {
  if (currentFilter === 'ALL') return dataset;
  return dataset.filter(item => item.status === currentFilter);
}

function handleUpdateItemProp(item, prop, val) {
  updateItemProperty(item, prop, val, currentUser, render);
}

function handleSetupEditableText(el, item, prop) {
  setupEditableText(el, item, prop, currentUser);
}

function handleAddSubcat(cat) {
  addNewSubcategoryToCategory(cat, currentUser, render);
}

function handleAddItem(cat, subcat) {
  addNewItemToCategory(cat, subcat, currentUser, render);
}

function handleDeleteItem(item) {
  deleteItem(item, currentUser, render);
}

function handleOpenChat(item) {
  const chatIssueSubtitle = document.getElementById('chatIssueSubtitle');
  const chatModal = document.getElementById('chatModal');
  const chatThreadContainer = document.getElementById('chatThreadContainer');
  const chatInput = document.getElementById('chatInput');
  openChatModal(item, currentUser, chatIssueSubtitle, chatModal, chatThreadContainer, chatInput);
}

function render() {
  updateStats(dataset);
  const filtered = getFilteredData();
  renderTableView(
    filtered, handleUpdateItemProp, handleOpenChat, handleDeleteItem,
    handleAddSubcat, handleAddItem, handleSetupEditableText, getFilteredData
  );
  renderKanbanView(
    filtered, currentFilter, handleUpdateItemProp, handleOpenChat, handleSetupEditableText, currentUser
  );
}

function initApp() {
  setRenderCallback(render);
  setChatUpdateCallback(() => {
    const chatThreadContainer = document.getElementById('chatThreadContainer');
    if (activeChatItem && chatThreadContainer) {
      const updatedItem = dataset.find(d => d.issue === activeChatItem.issue);
      if (updatedItem) renderChatThread(chatThreadContainer, currentUser);
    }
  });

  initToastEvents();
  initSyncListeners();
  initGlobalListeners(getCurrentUser, setCurrentUser, getCurrentFilter, setCurrentFilter, getFilteredData, render, isLiveEnvironment);
  applyUserTheme(currentUser);

  syncFromDatabase();
  initWebSocketConnection();
}

// Initialize application directly (script is deferred / at bottom of body)
initApp();

