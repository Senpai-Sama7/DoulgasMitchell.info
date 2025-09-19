export function addBentoBlocks(editor){
  const bm = editor.BlockManager;

  bm.add('logo-tile', {
    label: 'Logo Tile',
    category: 'Bento',
    content: `<section class="tile logo-tile"><h1>Douglas Mitchell</h1><p>Design • Code • Media</p></section>`
  });

  bm.add('typography-tile', {
    label: 'Typography Tile',
    category: 'Bento',
    content: `<section class="tile typography-tile"><blockquote>“Great UX feels inevitable.”</blockquote></section>`
  });

  bm.add('toast-tile', {
    label: 'Toast / Notice',
    category: 'Bento',
    content: `<section class="tile toast-tile"><div class="toast">🔔 New comment on “Bento Grids”.</div></section>`
  });

  bm.add('kpi-tile', {
    label: 'KPI Tile',
    category: 'Bento',
    content: `<section class="tile kpi-tile"><div class="value">128</div><div class="label">Posts</div></section>`
  });

  bm.add('imagery-tile', {
    label: 'Vivid Imagery',
    category: 'Bento',
    content: `<figure class="tile imagery-tile" style="background-image:url('/media/gradient-1.svg');"><figcaption>Hero Imagery</figcaption></figure>`
  });

  bm.add('links-tile', {
    label: 'Quick Links',
    category: 'Bento',
    content: `<nav class="tile links-tile"><ul><li><a href="/">Home</a></li><li><a href="/posts/notes-bento-tips">Notes</a></li><li><a href="/posts/microinteractions-video">Video</a></li></ul></nav>`
  });

  bm.add('phone-tile', {
    label: 'Phone Mockup',
    category: 'Bento',
    content: `<section class="tile phone-tile"><div class="phone"><img alt="Phone" src="/media/phone-frame.svg" /><ul class="feed"><li>Designing with Bento Grids</li><li>Motion Micro‑interactions</li><li>Ambient Study Mix</li></ul></div></section>`
  });
}
