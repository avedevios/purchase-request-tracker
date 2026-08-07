import { dataset, setDataset, saveChanges } from '../api.js';
import { updateStats } from '../views/stats.js';
import { collapsedLevel1, collapsedLevel2 } from '../views/table.js';
import { showToast } from '../ui/toast.js';
import { triggerFireworks, triggerSadAnimation } from '../ui/animations.js';
import { activeChatItem } from '../ui/modal.js';

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

export function deleteItem(item, currentUser, render) {
  if (!confirm(`Are you sure you want to delete item: "${item.issue}"?`)) return;

  setDataset(dataset.filter(d => d !== item));
  render();
  saveChanges(currentUser, activeChatItem);
  showToast('Item deleted successfully.', '🗑️');
}
