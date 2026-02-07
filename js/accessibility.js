// accessibility.js
(function(){
  const root = document.documentElement;

  function injectSkipLink(){
    if(document.querySelector('.skip-to-content')) return;
    const a = document.createElement('a');
    a.href = '#main';
    a.className = 'skip-to-content';
    a.textContent = 'Skip to main content';
    Object.assign(a.style, {
      position: 'fixed',
      top: '12px',
      left: '12px',
      padding: '8px 14px',
      borderRadius: '999px',
      background: 'rgba(6,9,19,0.9)',
      color: '#e7ecf3',
      border: '1px solid rgba(161,180,210,0.5)',
      fontSize: '13px',
      transform: 'translateY(-200%)',
      transition: 'transform .2s ease',
      zIndex: '10000'
    });
    a.addEventListener('focus',()=>{a.style.transform='translateY(0)';});
    a.addEventListener('blur',()=>{a.style.transform='translateY(-200%)';});
    document.body.prepend(a);
  }

  function enableFocusOutline(){
    function handleFirstTab(e){
      if(e.key === 'Tab'){
        root.classList.add('user-is-tabbing');
        window.removeEventListener('keydown', handleFirstTab);
      }
    }
    window.addEventListener('keydown', handleFirstTab);
  }

  function applyReducedMotion(){
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if(mq.matches){
      root.setAttribute('data-reduced-motion','true');
    }
  }

  function init(){
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    injectSkipLink();
    enableFocusOutline();
    applyReducedMotion();
  }

  init();
})();
