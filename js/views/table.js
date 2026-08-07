/** @module views/table — 2-Level foldable category hierarchy table renderer with column sorting & empty states. */
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

export let sortColumn = null;
export let sortDirection = 'asc';

/** Sort weights for custom ordering */
const PRIO_WEIGHTS = { 'Must': 3, 'Should': 2, 'Could': 1 };
const STATUS_WEIGHTS = { 'Fixed': 4, 'To Do': 3, 'Backlog': 2, 'Deprecated': 1 };

/** Sorts data array according to active sortColumn and sortDirection */
export function sortDataset(data, col, dir) {
  if (!col) return data;
  const multiplier = dir === 'asc' ? 1 : -1;

  return [...data].sort((a, b) => {
    let valA = a[col] || '';
    let valB = b[col] || '';

    if (col === 'priority') {
      valA = PRIO_WEIGHTS[a.priority] || 0;
      valB = PRIO_WEIGHTS[b.priority] || 0;
    } else if (col === 'status') {
      valA = STATUS_WEIGHTS[a.status] || 0;
      valB = STATUS_WEIGHTS[b.status] || 0;
    }

    if (valA < valB) return -1 * multiplier;
    if (valA > valB) return 1 * multiplier;
    return 0;
  });
}

export function renderTableView(data, updateProp, openChat, deleteItem, addSubcat, addItem, setupEditable, getFilteredData) {
  const tbody = document.getElementById('tableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  updateHeaderSortIndicators();

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 3rem 1.5rem; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📋</div>
          <div style="font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem; color: var(--text-main);">No purchase requests found</div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">Add a new category or connect your database to get started.</div>
          <button class="btn btn-primary" id="tableEmptyStateAddBtn" style="width: auto; padding: 0 1rem; font-size: 0.8rem; margin: 0 auto; display: inline-flex;">+ Add First Category</button>
        </td>
      </tr>`;
    
    const btn = document.getElementById('tableEmptyStateAddBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        const catName = prompt('Enter new category name:');
        if (catName?.trim()) addSubcat(catName.trim());
      });
    }
    return;
  }

  const sortedData = sortDataset(data, sortColumn, sortDirection);

  const hierarchy = new Map();
  sortedData.forEach(item => {
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

/** Updates sorting classes on table <th> elements */
function updateHeaderSortIndicators() {
  document.querySelectorAll('th.sortable').forEach(th => {
    const col = th.getAttribute('data-sort');
    th.classList.remove('sort-asc', 'sort-desc');
    if (col === sortColumn) {
      th.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
    }
  });
}

/** Configures table header sorting & column resize listeners */
export function initTableSortListeners(render) {
  document.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', (e) => {
      if (e.target.classList.contains('col-resizer')) return;
      const col = th.getAttribute('data-sort');
      if (sortColumn === col) {
        if (sortDirection === 'asc') sortDirection = 'desc';
        else { sortColumn = null; sortDirection = 'asc'; }
      } else {
        sortColumn = col;
        sortDirection = 'asc';
      }
      render();
    });
  });

  initColumnResizers();
}

/** Initializes drag-to-resize handlers on table column headers */
export function initColumnResizers() {
  document.querySelectorAll('th .col-resizer').forEach(resizer => {
    let startX, startWidth, th;

    const onMouseMove = (e) => {
      if (!th) return;
      const newWidth = Math.min(700, Math.max(70, startWidth + (e.clientX - startX)));
      th.style.width = `${newWidth}px`;
    };

    const onMouseUp = () => {
      resizer.classList.remove('resizing');
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    resizer.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      th = resizer.parentElement;
      startX = e.clientX;
      startWidth = th.offsetWidth;
      resizer.classList.add('resizing');
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
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
