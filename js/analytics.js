// analytics.js
(function(){
  const sessionId = Math.random().toString(36).slice(2);

  function track(event, payload){
    if(!event) return;
    const data = {
      event,
      payload: payload || {},
      ts: Date.now(),
      path: location.pathname,
      sessionId
    };
    console.info('[analytics]', data);
  }

  function bindCTAs(){
    document.querySelectorAll('.cta .btn').forEach(btn => {
      btn.addEventListener('click', () => {
        track('cta_click', { label: btn.textContent?.trim() || '' });
      });
    });
  }

  function init(){
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    track('page_view');
    bindCTAs();
  }

  init();

  window.__dmTrack = track;
})();
