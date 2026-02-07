// micro-interactions.js
(function(){
  function hoverLift(selector){
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('mouseenter', ()=>{
        el.style.transform = 'translateY(-4px)';
      });
      el.addEventListener('mouseleave', ()=>{
        el.style.transform = '';
      });
    });
  }

  function fadeInOnView(){
    const els = document.querySelectorAll('.reveal');
    if(!('IntersectionObserver' in window)){
      els.forEach(el=> el.classList.add('on'));
      return;
    }
    const io = new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add('on');
          io.unobserve(e.target);
        }
      });
    }, {threshold: .15});
    els.forEach(el=> io.observe(el));
  }

  function init(){
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    hoverLift('.card.glass, .repo.glass, .btn.glass');
    fadeInOnView();
  }

  init();
})();
