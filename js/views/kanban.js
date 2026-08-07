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

export function renderKanbanView(data, currentFilter, updateProp, openChat, setupEditable) {
  const kanbanGrid = document.getElementById('kanbanView');
  if (!kanbanGrid) return;
  kanbanGrid.innerHTML = '';

  const columns = currentFilter === 'ALL' ? ['Fixed', 'To Do', 'Backlog', 'Deprecated'] : [currentFilter];

  columns.forEach(colStatus => {
    const colData = data.filter(d => d.status === colStatus);
    const colEl = document.createElement('div');
    colEl.className = 'kanban-col';

    colEl.innerHTML = `
      <div class="kanban-col-header">
        <div class="kanban-col-title">${badge(getStatusClass(colStatus), colStatus)}</div>
        <span class="count-badge">${colData.length}</span>
      </div>
      <div class="kanban-cards">
        ${colData.length === 0 ? '<div style="color: var(--text-dim); font-size: 0.8rem; text-align: center; padding: 1.5rem 0;">No items</div>' : ''}
        ${colData.map(item => {
          const { category, subcategory } = getItemCategoryInfo(item);
          const catDisplay = subcategory ? `${category} › ${subcategory}` : category;

          return `
          <div class="kanban-card">
            <div class="card-meta">
              <span class="card-category">${catDisplay}</span>
              ${renderBallSelect(item.ball)}
            </div>
            <div class="editable-text card-issue" contenteditable="true" title="Click to edit issue text">${item.issue}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.2rem;">
              ${renderRoleSelect(item.role)}
              ${renderPrioSwitcher(item)}
              ${renderStatusSelect(item.status)}
            </div>
            <div class="detail-box">
              ${renderResponseBtn(item)}
            </div>
          </div>
        `;
        }).join('')}
      </div>
    `;

    colEl.querySelectorAll('.kanban-card').forEach((cardEl, idx) => {
      bindRowControls(cardEl, colData[idx], updateProp, openChat, null, setupEditable);
    });

    kanbanGrid.appendChild(colEl);
  });
}
