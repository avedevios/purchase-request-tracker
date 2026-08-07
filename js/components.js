const STATUSES = ['Fixed', 'To Do', 'Backlog', 'Deprecated'];
const BALLS = ['', 'Anton', 'Adonis'];
const ROLES = ['', 'Emp', 'DM', 'PM', 'PO', 'GM'];

// EDSL Tag & Element Builders
export const tag = (t, c, inner, attrs = '') => `<${t}${c ? ` class="${c}"` : ''}${attrs ? ` ${attrs}` : ''}>${inner}</${t}>`;
export const td = (c, inner) => tag('td', c, inner);
export const badge = (c, text) => tag('span', `badge ${c}`, text);

/**
 * @param {import('./types.js').IssueItem} item
 * @returns {{ category: string, subcategory: string|null }}
 */
export function getItemCategoryInfo(item) {
  let cat = item.category || 'Uncategorized';
  let subcat = item.subcategory || null;
  if (cat.includes('>')) {
    const parts = cat.split('>').map(s => s.trim());
    cat = parts[0];
    subcat = parts[1] || null;
  }
  return { category: cat, subcategory: subcat };
}

export function getBallClass(ball) {
  return !ball ? 'ball-none' : ball === 'Anton' ? 'ball-anton' : ball === 'Adonis' ? 'ball-adonis' : 'ball-none';
}

export function getStatusClass(status) {
  if (!status) return 'status-deprecated';
  const s = status.toLowerCase().replace(/\s+/g, '');
  return s === 'fixed' ? 'status-fixed' : s === 'todo' ? 'status-todo' : s === 'backlog' ? 'status-backlog' : 'status-deprecated';
}

export function getPrioClass(priority) {
  if (!priority) return 'prio-none';
  const p = priority.toLowerCase();
  return p === 'must' ? 'prio-must' : p === 'should' ? 'prio-should' : p === 'could' ? 'prio-could' : 'prio-none';
}

export function getRoleClass(role) { return role ? 'role-badge' : 'role-none'; }

export function getRowStatusClass(status) {
  if (!status) return 'row-status-deprecated';
  const s = status.toLowerCase().replace(/\s+/g, '');
  return s === 'fixed' ? 'row-status-fixed' : s === 'todo' ? 'row-status-todo' : s === 'backlog' ? 'row-status-backlog' : 'row-status-deprecated';
}

export function getResponseButtonLabel(item) {
  if (item.comments && item.comments.length > 0) {
    return `💬 (${item.comments.length}) ${item.comments[item.comments.length - 1].text}`;
  }
  return item.response ? `💬 ${item.response}` : `+ Add Response`;
}

export function renderSelect(className, options, currentValue, defaultLabel = '— None —') {
  const opts = options.map(opt => `<option value="${opt}" ${currentValue === opt ? 'selected' : ''}>${opt || defaultLabel}</option>`).join('');
  return `<select class="badge-select ${className}">${opts}</select>`;
}

export function renderStatusSelect(status) { return renderSelect(`${getStatusClass(status)} status-select`, STATUSES, status); }
export function renderBallSelect(ball) { return renderSelect(`${getBallClass(ball)} ball-select`, BALLS, ball || ''); }
export function renderRoleSelect(role) { return renderSelect(`${getRoleClass(role)} role-select`, ROLES, role || ''); }

export function renderPrioSwitcher(item) {
  const btns = ['Must', 'Should', 'Could'].map(p => 
    `<button type="button" class="prio-btn ${item.priority === p ? `active prio-${p.toLowerCase()}` : ''}" data-prio="${p}">${p[0]}</button>`
  ).join('');
  return `<div class="prio-switcher-pill" title="Priority: Must / Should / Could">${btns}</div>`;
}

export function renderResponseBtn(item) {
  const hasResp = (item.comments && item.comments.length > 0) || item.response;
  return `<button class="btn-response-action ${!hasResp ? 'empty-response' : ''}" title="Open discussion"><span class="response-btn-text">${getResponseButtonLabel(item)}</span></button>`;
}

export function bindPrioSwitcherEvents(containerElement, item, updateItemPropertyCallback) {
  containerElement.querySelectorAll('.prio-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const clickedPrio = btn.getAttribute('data-prio');
      updateItemPropertyCallback(item, 'priority', item.priority === clickedPrio ? null : clickedPrio);
    });
  });
}

export function bindRowControls(el, item, updateProp, openChat, deleteItem, setupEditable) {
  el.querySelector('.status-select')?.addEventListener('change', (e) => updateProp(item, 'status', e.target.value));
  el.querySelector('.ball-select')?.addEventListener('change', (e) => updateProp(item, 'ball', e.target.value));
  el.querySelector('.role-select')?.addEventListener('change', (e) => updateProp(item, 'role', e.target.value));
  bindPrioSwitcherEvents(el, item, updateProp);
  
  const responseBtn = el.querySelector('.btn-response-action');
  if (responseBtn && openChat) responseBtn.addEventListener('click', () => openChat(item));
  
  const deleteBtn = el.querySelector('.btn-delete-item');
  if (deleteBtn && deleteItem) deleteBtn.addEventListener('click', () => deleteItem(item));

  const issueEl = el.querySelector('.issue-text') || el.querySelector('.card-issue');
  if (issueEl && setupEditable) setupEditable(issueEl, item, 'issue');
}
