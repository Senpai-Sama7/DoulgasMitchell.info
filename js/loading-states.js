// loading-states.js
(function(){
  function decorateLoadingLinks(){
    document.querySelectorAll('a[data-loading]').forEach(link => {
      link.addEventListener('click', () => {
        link.dataset.loadingActive = 'true';
      });
    });
  }

  function globalNavigationSpinner(){
    const bar = document.createElement('div');
    bar.id = 'global-loading-bar';
    Object.assign(bar.style,{
      position:'fixed',
      top:'0',
      left:'0',
      height:'2px',
      width:'0%',
      background:'linear-gradient(90deg,#7aa8ff,#9d7aff)',
      boxShadow:'0 0 12px rgba(122,168,255,0.7)',
      transition:'width .3s ease-out, opacity .4s ease-out',
      zIndex:'9999',
      opacity:'0'
    });
    document.body.appendChild(bar);

    let active = 0;
    function start(){
      active++;
      bar.style.opacity = '1';
      bar.style.width = '40%';
      setTimeout(()=>{ if(active>0) bar.style.width = '80%'; }, 400);
    }
    function done(){
      active = Math.max(0, active-1);
      if(active === 0){
        bar.style.width = '100%';
        setTimeout(()=>{
          bar.style.opacity = '0';
          bar.style.width = '0%';
        }, 350);
      }
    }

    window.addEventListener('beforeunload', start);
    window.addEventListener('load', done);
  }

  function init(){
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    decorateLoadingLinks();
    globalNavigationSpinner();
  }

  init();
})();
