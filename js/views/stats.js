export function updateStats(data) {
  const statTotal = document.getElementById('statTotal');
  const statFixed = document.getElementById('statFixed');
  const statTodo = document.getElementById('statTodo');
  const statBacklog = document.getElementById('statBacklog');
  const statDeprecated = document.getElementById('statDeprecated');

  if (statTotal) statTotal.textContent = data.length;
  if (statFixed) statFixed.textContent = data.filter(d => d.status === 'Fixed').length;
  if (statTodo) statTodo.textContent = data.filter(d => d.status === 'To Do').length;
  if (statBacklog) statBacklog.textContent = data.filter(d => d.status === 'Backlog').length;
  if (statDeprecated) statDeprecated.textContent = data.filter(d => d.status === 'Deprecated').length;
}

export function initStatCardEvents(getCurrentFilter, setCurrentFilter, renderCallback) {
  const statCards = document.querySelectorAll('.stat-card');
  statCards.forEach(card => {
    card.addEventListener('click', () => {
      const targetFilter = card.getAttribute('data-filter');
      let currentFilter = getCurrentFilter();

      if (currentFilter === targetFilter && targetFilter !== 'ALL') {
        currentFilter = 'ALL';
      } else {
        currentFilter = targetFilter;
      }

      setCurrentFilter(currentFilter);

      statCards.forEach(c => {
        if (c.getAttribute('data-filter') === currentFilter) {
          c.classList.add('active');
        } else {
          c.classList.remove('active');
        }
      });

      renderCallback();
    });
  });
}
