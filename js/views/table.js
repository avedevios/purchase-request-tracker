import { SVG_ADD_SUBCAT, SVG_ADD_ITEM } from '../config.js';
import {
  getItemCategoryInfo,
  getRowStatusClass,
  renderStatusSelect,
  renderBallSelect,
  renderRoleSelect,
  renderPrioSwitcher,
  renderResponseBtn,
  bindRowControls,
  td
} from '../components.js';

export const collapsedLevel1 = new Set();
export const collapsedLevel2 = new Set();

export function renderTableView(data, updateProp, openChat, deleteItem, addSubcat, addItem, setupEditable, getFilteredData) {
  const tbody = document.getElementById('tableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">No items match the selected filter.</td></tr>`;
    return;
  }

  const hierarchy = new Map();
  data.forEach(item => {
    const { category: l1, subcategory: l2 } = getItemCategoryInfo(item);
    if (!hierarchy.has(l1)) hierarchy.set(l1, new Map());
    const l1Map = hierarchy.get(l1);
    if (!l1Map.has(l2)) l1Map.set(l2, []);
    l1Map.get(l2).push(item);
  });

  hierarchy.forEach((l2Map, l1Name) => {
    let total = 0;
    l2Map.forEach(items => { total += items.length; });

    const isL1Collapsed = collapsedLevel1.has(l1Name);
    const l1Row = document.createElement('tr');
    l1Row.className = 'level1-row';
    l1Row.title = 'Click to fold/unfold main category';
    l1Row.innerHTML = `
      <td colspan="6">
        <div class="group-header-content">
          <span class="fold-arrow">${isL1Collapsed ? '▶' : '▼'}</span>
          <span>${l1Name}</span>
          <span class="category-count-badge">${total}</span>
          <div class="group-actions-wrapper">
            <button class="group-icon-btn btn-subcat-icon" title="Create subcategory">${SVG_ADD_SUBCAT}</button>
            <button class="group-icon-btn btn-item-icon" title="Add item">${SVG_ADD_ITEM}</button>
          </div>
        </div>
      </td>
    `;

    l1Row.querySelector('.btn-subcat-icon').addEventListener('click', (e) => { e.stopPropagation(); addSubcat(l1Name); });
    l1Row.querySelector('.btn-item-icon').addEventListener('click', (e) => { e.stopPropagation(); addItem(l1Name, null); });
    l1Row.addEventListener('click', () => {
      if (collapsedLevel1.has(l1Name)) collapsedLevel1.delete(l1Name);
      else collapsedLevel1.add(l1Name);
      renderTableView(getFilteredData(), updateProp, openChat, deleteItem, addSubcat, addItem, setupEditable, getFilteredData);
    });

    tbody.appendChild(l1Row);

    if (!isL1Collapsed) {
      l2Map.forEach((items, l2Name) => {
        if (l2Name) {
          const l2Key = `${l1Name} > ${l2Name}`;
          const isL2Collapsed = collapsedLevel2.has(l2Key);

          const l2Row = document.createElement('tr');
          l2Row.className = 'level2-row';
          l2Row.title = 'Click to fold/unfold subcategory';
          l2Row.innerHTML = `
            <td colspan="6">
              <div class="group-header-content">
                <span class="fold-arrow">${isL2Collapsed ? '▶' : '▼'}</span>
                <span>${l2Name}</span>
                <span class="category-count-badge">${items.length}</span>
                <button class="group-icon-btn btn-item-icon" style="margin-left: auto;" title="Add item">${SVG_ADD_ITEM}</button>
              </div>
            </td>
          `;

          l2Row.querySelector('.btn-item-icon').addEventListener('click', (e) => { e.stopPropagation(); addItem(l1Name, l2Name); });
          l2Row.addEventListener('click', (e) => {
            e.stopPropagation();
            if (collapsedLevel2.has(l2Key)) collapsedLevel2.delete(l2Key);
            else collapsedLevel2.add(l2Key);
            renderTableView(getFilteredData(), updateProp, openChat, deleteItem, addSubcat, addItem, setupEditable, getFilteredData);
          });

          tbody.appendChild(l2Row);

          if (!isL2Collapsed) {
            items.forEach(item => appendRow(tbody, item, true, updateProp, openChat, deleteItem, setupEditable));
          }
        } else {
          items.forEach(item => appendRow(tbody, item, false, updateProp, openChat, deleteItem, setupEditable));
        }
      });
    }
  });
}

function appendRow(tbody, item, isLevel2, updateProp, openChat, deleteItem, setupEditable) {
  const tr = document.createElement('tr');
  tr.className = `item-row ${isLevel2 ? 'level2-item-row' : ''} ${getRowStatusClass(item.status)}`;
  tr.innerHTML = 
    td('', renderStatusSelect(item.status)) +
    td('', renderBallSelect(item.ball)) +
    td('', renderPrioSwitcher(item)) +
    td('', renderRoleSelect(item.role)) +
    td('', `<div class="editable-text issue-text" contenteditable="true" title="Click to edit">${item.issue || ''}</div>`) +
    td('', `<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.3rem;">${renderResponseBtn(item)}<button class="btn-delete-item" title="Delete item">&times;</button></div>`);
  
  bindRowControls(tr, item, updateProp, openChat, deleteItem, setupEditable);
  tbody.appendChild(tr);
}
