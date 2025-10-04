
export function bootUX(){
  if (typeof window === 'undefined') return;

  const html = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const storedTheme = window.localStorage.getItem('theme');
  const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
  const btn = document.getElementById('theme-btn');

  const applyTheme = (theme) => {
    html.setAttribute('data-theme', theme);
    window.localStorage.setItem('theme', theme);
    if (btn) {
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      const icon = btn.querySelector('.theme-toggle__icon');
      if (icon) icon.textContent = theme === 'dark' ? '☾' : '☀︎';
      btn.dataset.theme = theme;
    }
  };

  applyTheme(initialTheme);

  if (btn && !btn.dataset.bound) {
    btn.dataset.bound = 'true';
    btn.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    document
      .querySelectorAll('.bento-grid .tile, .bento-grid .bento-item')
      .forEach((el) => {
        el.classList.remove('will-animate');
        el.classList.add('animate-fade-in-up');
        el.dataset.animated = 'true';
      });
  }

  const io = prefersReducedMotion
    ? null
    : new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.remove('will-animate');
          entry.target.classList.add('animate-fade-in-up');
          entry.target.dataset.animated = 'true';
          io.unobserve(entry.target);
        }
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document
    .querySelectorAll('.bento-grid .tile, .bento-grid .bento-item')
    .forEach((el) => {
      if (!el.dataset.observed && el.dataset.animated !== 'true') {
        el.dataset.observed = 'true';
        if (!prefersReducedMotion) {
          el.classList.add('will-animate');
          io?.observe(el);
        }
      }
    });

  const grid = document.querySelector('.bento-grid');
  if (grid && !grid.dataset.bound) {
    grid.dataset.bound = 'true';
    grid.addEventListener('click', (ev) => {
      const tile = ev.target.closest('.tile, .bento-item');
      if (!tile) return;
      const title = tile.querySelector('h3,h4')?.textContent?.trim();
      if (title) {
        console.debug('[bento] tile interaction', title);
      }
    });
  }
}
