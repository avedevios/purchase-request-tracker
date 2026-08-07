/** @module app/actions — Item property mutations, category/subcategory creation, and item deletion. */
import { dataset, setDataset, saveChanges } from '../api.js';
import { updateStats } from '../views/stats.js';
import { collapsedLevel1, collapsedLevel2 } from '../views/table.js';
import { showToast } from '../ui/toast.js';
import { triggerFireworks, triggerSadAnimation } from '../ui/animations.js';
import { activeChatItem } from '../ui/modal.js';

/**
 * Mutates a single property on an item, triggers animations for status changes, re-renders, and saves.
 * @param {import('../types.js').IssueItem} item @param {string} prop @param {*} value @param {string} currentUser @param {function} render
 */
export function updateItemProperty(item, prop, value, currentUser, render) {
  const oldVal = item[prop];
  item[prop] = value || null;

  if (prop === 'status' && oldVal !== value) {
    if (value === 'Fixed') triggerFireworks();
    else if (value === 'Deprecated') triggerSadAnimation();
  }

  render();
  saveChanges(currentUser, activeChatItem);
}

/**
 * Binds a contenteditable element to save its text to an item property on blur.
 * @param {HTMLElement} element @param {import('../types.js').IssueItem} item @param {string} propertyName @param {string} currentUser
 */
export function setupEditableText(element, item, propertyName, currentUser) {
  if (!element) return;
  element.addEventListener('blur', () => {
    let newText = element.innerText.trim();
    if (newText !== (item[propertyName] || '')) {
      item[propertyName] = newText || null;
      updateStats(dataset);
      saveChanges(currentUser, activeChatItem);
    }
  });
}

/**
 * Prompts for a subcategory name, prepends a new item, expands the group, and saves.
 * @param {string} category @param {string} currentUser @param {function} render
 */
export function addNewSubcategoryToCategory(category, currentUser, render) {
  const subcatName = prompt(`Create new subcategory under category "${category}":`);
  if (!subcatName?.trim()) return;

  const trimmedSubcat = subcatName.trim();
  const newItem = {
    category: category,
    subcategory: trimmedSubcat,
    status: 'To Do',
    priority: 'Should',
    role: null,
    issue: `New item under ${trimmedSubcat}...`,
    response: null,
    ball: null,
    comments: []
  };

  dataset.unshift(newItem);
  collapsedLevel1.delete(category);
  collapsedLevel2.delete(`${category} > ${trimmedSubcat}`);

  render();
  saveChanges(currentUser, activeChatItem);
  showToast(`Created subcategory "${trimmedSubcat}"!`, '📁');
}

/**
 * Prepends a new blank item under the given category/subcategory, expands the group, and saves.
 * @param {string} category @param {string|null} subcategory @param {string} currentUser @param {function} render
 */
export function addNewItemToCategory(category, subcategory, currentUser, render) {
  const newItem = {
    category: category,
    subcategory: subcategory || null,
    status: 'To Do',
    priority: 'Should',
    role: null,
    issue: subcategory ? `New item under ${subcategory}...` : 'New item issue description...',
    response: null,
    ball: null,
    comments: []
  };

  dataset.unshift(newItem);
  collapsedLevel1.delete(category);
  if (subcategory) collapsedLevel2.delete(`${category} > ${subcategory}`);

  render();
  saveChanges(currentUser, activeChatItem);
  showToast(`Added new item under ${category}${subcategory ? ' › ' + subcategory : ''}!`, '➕');
}

/**
 * Confirms with user, removes the item from the dataset, re-renders, and saves.
 * @param {import('../types.js').IssueItem} item @param {string} currentUser @param {function} render
 */
export function deleteItem(item, currentUser, render) {
  if (!confirm(`Are you sure you want to delete item: "${item.issue}"?`)) return;

  setDataset(dataset.filter(d => d !== item));
  render();
  saveChanges(currentUser, activeChatItem);
  showToast('Item deleted successfully.', '🗑️');
}
