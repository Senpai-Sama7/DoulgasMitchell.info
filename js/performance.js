// performance.js
(function(){
  function markReady(){
    document.documentElement.classList.add('js-ready');
  }

  function logWebVitals(){
    if(!('performance' in window)) return;
    setTimeout(()=>{
      const timing = performance.timing;
      const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
      if(domContentLoaded > 0){
        console.info('[perf] DOMContentLoaded:', domContentLoaded,'ms');
      }
    }, 0);
  }

  function init(){
    if(document.readyState === 'complete' || document.readyState === 'interactive'){
      markReady();
      logWebVitals();
    } else {
      document.addEventListener('DOMContentLoaded', ()=>{
        markReady();
        logWebVitals();
      });
    }
  }

  init();
})();
