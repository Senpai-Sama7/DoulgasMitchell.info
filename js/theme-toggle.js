// theme-toggle.js
(function(){
  const STORAGE_KEY = 'dm-theme';

  function getPreferredTheme(){
    const stored = localStorage.getItem(STORAGE_KEY);
    if(stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
  }

  function createToggle(){
    if(document.querySelector('[data-theme-toggle]')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label','Toggle color theme');
    btn.dataset.themeToggle = 'true';
    btn.textContent = 'Toggle theme';
    Object.assign(btn.style,{
      position:'fixed',
      right:'16px',
      bottom:'16px',
      padding:'10px 16px',
      borderRadius:'999px',
      border:'1px solid rgba(161,180,210,0.5)',
      background:'rgba(6,9,19,0.9)',
      color:'#e7ecf3',
      fontSize:'13px',
      cursor:'pointer',
      zIndex:'9000'
    });
    btn.addEventListener('click',()=>{
      const current = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
    document.body.appendChild(btn);
  }

  function init(){
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    applyTheme(getPreferredTheme());
    createToggle();
  }

  init();
})();
