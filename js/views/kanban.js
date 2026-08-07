/** @module views/kanban — Kanban board column card renderer with native drag-and-drop status mutations. */
import {
  getItemCategoryInfo,
  getStatusClass,
  renderStatusSelect,
  renderBallSelect,
  renderRoleSelect,
  renderPrioSwitcher,
  renderResponseBtn,
  bindRowControls,
  badge
} from '../components.js';

let draggedItem = null;

export function renderKanbanView(data, currentFilter, updateProp, openChat, setupEditable, currentUser) {
  const kanbanGrid = document.getElementById('kanbanView');
  if (!kanbanGrid) return;
  kanbanGrid.innerHTML = '';

  const columns = currentFilter === 'ALL' ? ['Fixed', 'To Do', 'Backlog', 'Deprecated'] : [currentFilter];

  columns.forEach(colStatus => {
    const colData = data.filter(d => d.status === colStatus);
    const colEl = document.createElement('div');
    colEl.className = 'kanban-col';
    colEl.setAttribute('data-status', colStatus);

    colEl.innerHTML = `
      <div class="kanban-col-header">
        <div class="kanban-col-title">${badge(getStatusClass(colStatus), colStatus)}</div>
        <span class="count-badge">${colData.length}</span>
      </div>
      <div class="kanban-cards">
        ${colData.length === 0 ? `
          <div style="color: var(--text-muted); font-size: 0.8rem; text-align: center; padding: 2rem 0.5rem; border: 1px dashed var(--border-color); border-radius: var(--radius-sm); margin-top: 0.25rem;">
            <div style="font-size: 1.25rem; margin-bottom: 0.2rem;">📌</div>
            <div>No ${colStatus} items</div>
            <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 0.2rem;">Drag cards here to update status</div>
          </div>` : ''}
      </div>
    `;

    const cardsContainer = colEl.querySelector('.kanban-cards');

    colData.forEach(item => {
      const { category, subcategory } = getItemCategoryInfo(item);
      const catDisplay = subcategory ? `${category} › ${subcategory}` : category;

      const cardEl = document.createElement('div');
      cardEl.className = 'kanban-card';
      cardEl.setAttribute('draggable', 'true');
      cardEl.innerHTML = `
        <div class="card-meta">
          <span class="card-category">${catDisplay}</span>
          ${renderBallSelect(item.ball)}
        </div>
        <div class="editable-text card-issue" contenteditable="true" title="Click to edit issue text">${item.issue || ''}</div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.2rem;">
          ${renderRoleSelect(item.role)}
          ${renderPrioSwitcher(item)}
          ${renderStatusSelect(item.status)}
        </div>
        <div class="detail-box">
          ${renderResponseBtn(item)}
        </div>
      `;

      // Drag & Drop Card Event Handlers
      cardEl.addEventListener('dragstart', (e) => {
        draggedItem = item;
        cardEl.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.issue || '');
      });

      cardEl.addEventListener('dragend', () => {
        cardEl.classList.remove('dragging');
        draggedItem = null;
        document.querySelectorAll('.kanban-col').forEach(c => c.classList.remove('drag-over'));
      });

      bindRowControls(cardEl, item, updateProp, openChat, null, setupEditable);
      cardsContainer.appendChild(cardEl);
    });

    // Drag & Drop Column Destination Handlers
    colEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      colEl.classList.add('drag-over');
    });

    colEl.addEventListener('dragleave', (e) => {
      if (!colEl.contains(e.relatedTarget)) {
        colEl.classList.remove('drag-over');
      }
    });

    colEl.addEventListener('drop', (e) => {
      e.preventDefault();
      colEl.classList.remove('drag-over');
      if (draggedItem && draggedItem.status !== colStatus) {
        updateProp(draggedItem, 'status', colStatus);
      }
    });

    kanbanGrid.appendChild(colEl);
  });
}
