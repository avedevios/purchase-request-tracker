/** @module components — HTML string generators and DOM event binders for table rows, cards, and controls. */
import { STATUSES, BALLS, ROLES } from './constants.js';

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

let activePopover = null;

export function closeActiveCloudPopover() {
  if (activePopover) {
    activePopover.remove();
    activePopover = null;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    if (activePopover && !activePopover.contains(e.target) && !e.target.classList.contains('badge-btn')) {
      closeActiveCloudPopover();
    }
  });
  window.addEventListener('scroll', closeActiveCloudPopover, { passive: true });
}

export function showOptionCloudPopover(triggerBtn, options, currentValue, onSelect) {
  if (activePopover && activePopover._triggerBtn === triggerBtn) {
    closeActiveCloudPopover();
    return;
  }
  closeActiveCloudPopover();

  const container = document.createElement('div');
  container.className = 'radial-orbit-menu';
  container._triggerBtn = triggerBtn;

  const radius = options.length > 5 ? 75 : 65;

  options.forEach((opt, idx) => {
    const angle = (idx * (2 * Math.PI / options.length)) - (Math.PI / 2);
    const tx = Math.cos(angle) * radius;
    const ty = Math.sin(angle) * radius;
    const isActive = currentValue === opt || (!currentValue && opt === '');
    const label = opt || '—';
    const optClass = opt ? opt.toLowerCase().replace(/\s+/g, '-') : 'none';

    const itemBtn = document.createElement('button');
    itemBtn.type = 'button';
    itemBtn.className = `radial-item ${isActive ? 'active' : ''} opt-${optClass}`;
    itemBtn.style.setProperty('--tx', `${tx}px`);
    itemBtn.style.setProperty('--ty', `${ty}px`);
    itemBtn.innerHTML = label;

    itemBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      onSelect(opt);
      closeActiveCloudPopover();
    });

    container.appendChild(itemBtn);
  });

  document.body.appendChild(container);
  const rect = triggerBtn.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2 + window.scrollX;
  const centerY = rect.top + rect.height / 2 + window.scrollY;

  container.style.top = `${centerY}px`;
  container.style.left = `${centerX}px`;

  requestAnimationFrame(() => {
    container.querySelectorAll('.radial-item').forEach(el => el.classList.add('open'));
  });

  activePopover = container;
}

export function renderSelect(className, options, currentValue, defaultLabel = '— None —') {
  const opts = options.map(opt => `<option value="${opt}" ${currentValue === opt ? 'selected' : ''}>${opt || defaultLabel}</option>`).join('');
  return `<select class="badge-select ${className}">${opts}</select>`;
}

export function renderStatusSelect(status) {
  return `<button type="button" class="badge-btn status-cloud-btn ${getStatusClass(status)}" data-status="${status || ''}">${status || 'Deprecated'}</button>`;
}

export function renderBallSelect(ball) {
  return `<button type="button" class="badge-btn ball-cloud-btn ${getBallClass(ball)}" data-ball="${ball || ''}">${ball || '— Ball —'}</button>`;
}

export function renderRoleSelect(role) {
  return `<button type="button" class="badge-btn role-cloud-btn ${getRoleClass(role)}" data-role="${role || ''}">${role || '— Role —'}</button>`;
}

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

  el.querySelector('.status-cloud-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    showOptionCloudPopover(e.currentTarget, STATUSES, item.status, (newVal) => updateProp(item, 'status', newVal));
  });

  el.querySelector('.ball-cloud-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    showOptionCloudPopover(e.currentTarget, BALLS, item.ball || '', (newVal) => updateProp(item, 'ball', newVal));
  });

  el.querySelector('.role-cloud-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    showOptionCloudPopover(e.currentTarget, ROLES, item.role || '', (newVal) => updateProp(item, 'role', newVal));
  });

  bindPrioSwitcherEvents(el, item, updateProp);
  
  const responseBtn = el.querySelector('.btn-response-action');
  if (responseBtn && openChat) responseBtn.addEventListener('click', () => openChat(item));
  
  const deleteBtn = el.querySelector('.btn-delete-item');
  if (deleteBtn && deleteItem) deleteBtn.addEventListener('click', () => deleteItem(item));

  const issueEl = el.querySelector('.issue-text') || el.querySelector('.card-issue');
  if (issueEl && setupEditable) setupEditable(issueEl, item, 'issue');
}
