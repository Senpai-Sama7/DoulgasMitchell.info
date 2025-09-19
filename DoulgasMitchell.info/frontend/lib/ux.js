
export function bootUX(){
  // Theme
  const html = document.documentElement;
  const saved = localStorage.getItem('theme') || 'light';
  html.setAttribute('data-theme', saved);
  const btn = document.getElementById('theme-btn');
  btn?.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  // IO for reveal
  const io = new IntersectionObserver((entries)=>{
    for(const e of entries){
      if(e.isIntersecting){ e.target.classList.add('animate-fade-in-up'); io.unobserve(e.target); }
    }
  }, { threshold:.1, rootMargin:'0px 0px -50px 0px' });
  document.querySelectorAll('.bento-item').forEach(el => io.observe(el));

  // Single delegated click for tiles
  const grid = document.querySelector('.bento-container');
  grid?.addEventListener('click', (ev) => {
    const tile = ev.target.closest('.bento-item');
    if(!tile) return;
    const title = tile.querySelector('h3,h4')?.textContent?.trim();
    if(title) console.log('Open:', title);
  });
}
