(function () {
  const STORAGE_KEY = 'yasminBarberTheme';

  function getPreferred() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {}
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
    // Update aria on buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro');
      btn.setAttribute('title', theme === 'dark' ? 'Modo claro' : 'Modo escuro');
    });
  }

  function toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    apply(current === 'dark' ? 'light' : 'dark');
  }

  // Apply ASAP to avoid flash
  apply(getPreferred());

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', toggle);
    });

    // Mobile menu
    const toggleBtn = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav-links');
    if (toggleBtn && nav) {
      toggleBtn.addEventListener('click', function () {
        const open = nav.classList.toggle('open');
        toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      // Close on link click (mobile)
      nav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          nav.classList.remove('open');
          toggleBtn.setAttribute('aria-expanded', 'false');
        });
      });
      // Close on escape
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && nav.classList.contains('open')) {
          nav.classList.remove('open');
          toggleBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }
  });
})();
