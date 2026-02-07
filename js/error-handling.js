// error-handling.js
(function(){
  function createToastContainer(){
    let c = document.querySelector('.dm-toast-container');
    if(c) return c;
    c = document.createElement('div');
    c.className = 'dm-toast-container';
    Object.assign(c.style,{
      position:'fixed',
      right:'16px',
      top:'16px',
      display:'flex',
      flexDirection:'column',
      gap:'8px',
      zIndex:'9500'
    });
    document.body.appendChild(c);
    return c;
  }

  function showToast(message){
    const c = createToastContainer();
    const t = document.createElement('div');
    t.textContent = message;
    Object.assign(t.style,{
      padding:'10px 14px',
      borderRadius:'12px',
      background:'rgba(120,30,30,0.95)',
      color:'#fff',
      fontSize:'13px',
      boxShadow:'0 10px 30px rgba(0,0,0,0.5)'
    });
    c.appendChild(t);
    setTimeout(()=>{
      t.style.opacity = '0';
      t.style.transform = 'translateY(-4px)';
      setTimeout(()=> t.remove(), 300);
    }, 4000);
  }

  function init(){
    window.addEventListener('error', (e)=>{
      console.error(e.error || e.message);
      showToast('Something went wrong. Please reload or try again.');
    });
    window.addEventListener('unhandledrejection', (e)=>{
      console.error(e.reason);
      showToast('A background task failed. Please try again.');
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
