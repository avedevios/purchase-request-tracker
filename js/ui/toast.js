let toastTimeout = null;

export function showToast(message, icon = '✨') {
  if (typeof document === 'undefined') return;
  const toast = document.getElementById('toast');
  const toastIcon = document.getElementById('toastIcon');
  const toastMessage = document.getElementById('toastMessage');

  if (!toast || !toastIcon || !toastMessage) return;

  toastIcon.textContent = icon;
  toastMessage.textContent = message;

  if (toastTimeout) clearTimeout(toastTimeout);
  toast.classList.add('show');

  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 8500);
}

export function initToastEvents() {
  const toastEl = document.getElementById('toast');
  if (toastEl) {
    toastEl.addEventListener('mouseenter', () => {
      if (toastTimeout) clearTimeout(toastTimeout);
    });
    toastEl.addEventListener('mouseleave', () => {
      if (toastEl.classList.contains('show')) {
        toastTimeout = setTimeout(() => toastEl.classList.remove('show'), 4000);
      }
    });
  }

  const closeToastBtn = document.getElementById('closeToastBtn');
  if (closeToastBtn) {
    closeToastBtn.addEventListener('click', () => {
      if (toastTimeout) clearTimeout(toastTimeout);
      toastEl.classList.remove('show');
    });
  }
}
