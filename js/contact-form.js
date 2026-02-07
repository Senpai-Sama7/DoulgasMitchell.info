// contact-form.js
(function(){
  function init(){
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    const form = document.querySelector('[data-contact-form]');
    if(!form) return; // no-op if not present

    const status = document.createElement('div');
    status.setAttribute('aria-live','polite');
    status.style.marginTop = '8px';
    status.style.fontSize = '13px';
    form.appendChild(status);

    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      status.textContent = 'Sending...';
      try{
        const body = new FormData(form);
        const res = await fetch(form.action || '#', {
          method: form.method || 'POST',
          body
        });
        if(res.ok){
          status.textContent = 'Message sent. Thank you!';
          form.reset();
        } else {
          status.textContent = 'Something went wrong. Please try again.';
        }
      }catch(err){
        console.error(err);
        status.textContent = 'Network error. Please try again later.';
      }
    });
  }

  init();
})();
