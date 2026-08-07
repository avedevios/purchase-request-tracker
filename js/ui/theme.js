/** @module ui/theme — Handles light/dark themes and user duty states with OS preference auto-detection. */
import { showToast } from './toast.js';

/**
 * Applies active user theme attribute and initial dark/light theme (from localStorage or OS preference).
 * @param {string} userName
 */
export function applyUserTheme(userName) {
  document.documentElement.setAttribute('data-user', userName);
  
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);

  const dutyTextEl = document.getElementById('dutyUserText');
  if (dutyTextEl) {
    dutyTextEl.textContent = `${userName.toUpperCase()} ON DUTY`;
  }
}

/**
 * Toggles dark/light theme manually and persists selection to localStorage.
 * @param {HTMLElement|null} themeToggleSvg @param {HTMLElement|null} themeBtn
 */
export function toggleTheme(themeToggleSvg, themeBtn) {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);

  updateThemeIcon(newTheme);
  showToast(`Theme switched to ${newTheme} mode!`, newTheme === 'dark' ? '🌙' : '☀️');
}

/** Updates header theme toggle SVG button icon matching current theme mode. */
function updateThemeIcon(theme) {
  const themeToggleSvg = document.getElementById('themeToggleSvg');
  const themeBtn = document.getElementById('themeToggleBtn');
  if (!themeToggleSvg || !themeBtn) return;

  if (theme === 'dark') {
    themeToggleSvg.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    themeBtn.title = 'Switch to Light Theme';
  } else {
    themeToggleSvg.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    themeBtn.title = 'Switch to Dark Theme';
  }
}

// Auto-detect OS theme changes if user hasn't explicitly set a preference
if (typeof window !== 'undefined' && window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      const newTheme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      updateThemeIcon(newTheme);
    }
  });
}
