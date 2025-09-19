
export function registerBentoBlocks(editor){
  const bm = editor.BlockManager;
  const dc = editor.DomComponents;

  // Base 'bento-item' component type with size trait
  dc.addType('bento-item', {
    isComponent: el => el.classList && el.classList.contains('bento-item'),
    model: {
      defaults: {
        tagName: 'article',
        classes: ['bento-item','bento-medium'],
        attributes: { role: 'region' },
        traits: [
          {
            type: 'select', label: 'Size', name: 'size',
            options: [
              { id: 'bento-small', name: 'Small' },
              { id: 'bento-medium', name: 'Medium' },
              { id: 'bento-large', name: 'Large' },
            ],
          },
        ],
        script: function(props){
          // reflect 'size' trait onto class
          const el = this;
          const size = el.getAttribute('data-size');
          if(size){
            el.classList.remove('bento-small','bento-medium','bento-large');
            el.classList.add(size);
          }
        }
      },
      init() {
        this.on('change:attributes:data-size', () => {
          const size = this.getAttributes()['data-size'];
          const cls = this.getClasses();
          const cleaned = cls.filter(c => !['bento-small','bento-medium','bento-large'].includes(c));
          this.setClass([...cleaned, size || 'bento-medium']);
        });
        this.on('change:size', (m, val) => {
          this.addAttributes({ 'data-size': val });
        });
      }
    }
  });

  // Helper: add a block with icon
  const addBlock = (id, label, content) => bm.add(id, { label, category: 'Bento', content });

  // Featured Post (large)
  dc.addType('bento-featured', {
    isComponent: el => el.classList?.contains('featured-post'),
    model: {
      defaults: {
        type: 'bento-item',
        classes: ['bento-item','bento-large','featured-post'],
        components: `
          <div class="bento-content">
            <span class="post-category">Featured</span>
            <h3>Featured title</h3>
            <p>Short excerpt...</p>
            <div class="post-meta">
              <span class="post-date"><i class="far fa-calendar"></i> Sep 1, 2025</span>
              <span class="post-reading"><i class="far fa-clock"></i> 5 min read</span>
            </div>
          </div>
          <div class="bento-media">
            <div class="placeholder-img ai-gradient"><i class="fas fa-robot"></i></div>
          </div>`,
        traits: [
          { type:'text', label:'Badge', name:'badge', placeholder:'Featured' },
          { type:'text', label:'Title', name:'title' },
          { type:'text', label:'Excerpt', name:'excerpt' },
          { type:'text', label:'Date', name:'date' },
          { type:'number', label:'Read (min)', name:'read' },
          { type:'select', label:'Gradient', name:'gradient',
            options:[
              {id:'ai-gradient', name:'AI'},
              {id:'tech-gradient', name:'Tech'},
              {id:'video-gradient', name:'Video'}
            ]}
        ],
        script: function(){
          const root = this;
          const sel = s => root.querySelector(s);
          const badge = root.getAttribute('data-badge') || 'Featured';
          const title = root.getAttribute('data-title') || 'Featured title';
          const excerpt = root.getAttribute('data-excerpt') || 'Short excerpt...';
          const date = root.getAttribute('data-date') || 'Sep 1, 2025';
          const read = root.getAttribute('data-read') || '5';
          const grad = root.getAttribute('data-gradient') || 'ai-gradient';
          sel('.post-category').textContent = badge;
          sel('h3').textContent = title;
          sel('p').textContent = excerpt;
          sel('.post-date').innerHTML = `<i class="far fa-calendar"></i> ${date}`;
          sel('.post-reading').innerHTML = `<i class="far fa-clock"></i> ${read} min read`;
          const ph = sel('.placeholder-img');
          ph.classList.remove('ai-gradient','tech-gradient','video-gradient');
          ph.classList.add(grad);
        }
      },
      init(){
        const map = {
          badge:'data-badge', title:'data-title', excerpt:'data-excerpt',
          date:'data-date', read:'data-read', gradient:'data-gradient'
        };
        Object.entries(map).forEach(([trait, attr]) => {
          this.on(`change:${trait}`, (m, val) => this.addAttributes({ [attr]: val }));
        });
      }
    }
  });
  addBlock('bento-featured', 'Featured Post', { type: 'bento-featured' });

  // Recent Post (medium)
  dc.addType('bento-recent', {
    isComponent: el => el.classList?.contains('recent-post'),
    model: {
      defaults: {
        type: 'bento-item',
        classes: ['bento-item','bento-medium','recent-post'],
        components: `
          <div class="bento-content">
            <span class="post-category">Tech</span>
            <h4>Recent post title</h4>
            <p>Short teaser...</p>
            <div class="post-meta"><span class="post-date"><i class="far fa-calendar"></i> Sep 1, 2025</span></div>
          </div>
          <div class="bento-media">
            <div class="placeholder-img tech-gradient"><i class="fas fa-code"></i></div>
          </div>`,
        traits: [
          {type:'text', name:'category', label:'Category'},
          {type:'text', name:'title', label:'Title'},
          {type:'text', name:'teaser', label:'Teaser'},
          {type:'text', name:'date', label:'Date'},
          {type:'select', name:'gradient', label:'Gradient', options:[
            {id:'tech-gradient', name:'Tech'},
            {id:'ai-gradient', name:'AI'},
            {id:'video-gradient', name:'Video'},
          ]},
          {type:'text', name:'icon', label:'FA Icon (fas fa-code)'},
        ],
        script: function(){
          const r = this, sel = s => r.querySelector(s);
          sel('.post-category').textContent = r.getAttribute('data-category') || 'Tech';
          sel('h4').textContent = r.getAttribute('data-title') || 'Recent post title';
          sel('p').textContent = r.getAttribute('data-teaser') || 'Short teaser...';
          sel('.post-date').innerHTML = `<i class="far fa-calendar"></i> ${r.getAttribute('data-date') || 'Sep 1, 2025'}`;
          const grad = r.getAttribute('data-gradient') || 'tech-gradient';
          const icon = r.getAttribute('data-icon') || 'fas fa-code';
          const ph = sel('.placeholder-img');
          ph.classList.remove('ai-gradient','tech-gradient','video-gradient');
          ph.classList.add(grad);
          const i = ph.querySelector('i'); i.className = icon;
        }
      },
      init(){
        const map = {category:'data-category',title:'data-title',teaser:'data-teaser',date:'data-date',gradient:'data-gradient',icon:'data-icon'};
        Object.entries(map).forEach(([t,a]) => this.on(`change:${t}`, (m,v)=> this.addAttributes({[a]:v})));
      }
    }
  });
  addBlock('bento-recent', 'Recent Post', { type: 'bento-recent' });

  // Stats (small)
  dc.addType('bento-stats', {
    isComponent: el => el.classList?.contains('stats-card'),
    model: {
      defaults: {
        type: 'bento-item',
        classes: ['bento-item','bento-small','stats-card'],
        components: `
          <div class="bento-content">
            <div class="stat-number">47</div>
            <div class="stat-label">Articles Written</div>
            <div class="stat-growth">↗ +12 this month</div>
          </div>`,
        traits: [
          {type:'number', name:'number', label:'Number'},
          {type:'text', name:'label', label:'Label'},
          {type:'text', name:'growth', label:'Growth'},
        ],
        script: function(){
          const root = this, s = q => root.querySelector(q);
          s('.stat-number').textContent = root.getAttribute('data-number') || '47';
          s('.stat-label').textContent = root.getAttribute('data-label') || 'Metric';
          s('.stat-growth').textContent = root.getAttribute('data-growth') || '↗ +0';
        }
      },
      init(){
        const map = { number:'data-number', label:'data-label', growth:'data-growth' };
        Object.entries(map).forEach(([t,a]) => this.on(`change:${t}`,(m,v)=> this.addAttributes({[a]:v})));
      }
    }
  });
  addBlock('bento-stats','Stats Card',{ type:'bento-stats' });

  // Media (video) with play button
  dc.addType('bento-media', {
    isComponent: el => el.classList?.contains('media-post'),
    model: {
      defaults: {
        type: 'bento-item',
        classes: ['bento-item','bento-medium','media-post'],
        components: `
          <div class="bento-content">
            <span class="post-category">Video</span>
            <h4>Media title</h4>
            <p>Short description...</p>
            <div class="play-button"><i class="fas fa-play"></i></div>
          </div>
          <div class="bento-media">
            <div class="placeholder-img video-gradient"><i class="fas fa-video"></i></div>
          </div>`,
        traits: [
          {type:'text', name:'category', label:'Category'},
          {type:'text', name:'title', label:'Title'},
          {type:'text', name:'desc', label:'Description'},
          {type:'select', name:'gradient', label:'Gradient', options:[
            {id:'video-gradient', name:'Video'},
            {id:'ai-gradient', name:'AI'},
            {id:'tech-gradient', name:'Tech'},
          ]},
          {type:'text', name:'icon', label:'FA Icon (fas fa-video)'},
          {type:'text', name:'url', label:'Video URL (embed)'},
        ],
        script: function(){
          const r=this, $=s=>r.querySelector(s);
          $('.post-category').textContent = r.getAttribute('data-category')||'Video';
          $('h4').textContent = r.getAttribute('data-title')||'Media title';
          $('p').textContent = r.getAttribute('data-desc')||'Short description...';
          const grad = r.getAttribute('data-gradient')||'video-gradient';
          const ph = $('.placeholder-img');
          ph.classList.remove('ai-gradient','tech-gradient','video-gradient');
          ph.classList.add(grad);
          const icon = r.getAttribute('data-icon')||'fas fa-video';
          ph.querySelector('i').className = icon;
          const url = r.getAttribute('data-url');
          if(url){ r.setAttribute('data-video-url', url); }
        }
      },
      init(){
        const map = {category:'data-category',title:'data-title',desc:'data-desc',gradient:'data-gradient',icon:'data-icon',url:'data-url'};
        Object.entries(map).forEach(([t,a])=> this.on(`change:${t}`,(m,v)=> this.addAttributes({[a]:v})));
      }
    }
  });
  addBlock('bento-media','Media (Video)',{ type: 'bento-media' });

  // About
  dc.addType('bento-about', {
    isComponent: el => el.classList?.contains('about-card'),
    model: {
      defaults: {
        type:'bento-item',
        classes:['bento-item','bento-small','about-card'],
        components:`
          <div class="bento-content">
            <div class="avatar"><i class="fas fa-user"></i></div>
            <h4>About Me</h4>
            <p>Short bio...</p>
            <div class="social-links">
              <a href="#"><i class="fab fa-github"></i></a>
              <a href="#"><i class="fab fa-linkedin"></i></a>
              <a href="#"><i class="fab fa-twitter"></i></a>
            </div>
          </div>`,
        traits:[
          {type:'text', name:'title', label:'Title'},
          {type:'text', name:'bio', label:'Bio'},
          {type:'text', name:'gh', label:'GitHub URL'},
          {type:'text', name:'li', label:'LinkedIn URL'},
          {type:'text', name:'tw', label:'Twitter/X URL'},
        ],
        script:function(){
          const r=this,$=s=>r.querySelector(s);
          $('h4').textContent = r.getAttribute('data-title')||'About Me';
          $('p').textContent = r.getAttribute('data-bio')||'Short bio...';
          const links = $('.social-links').querySelectorAll('a');
          const gh=r.getAttribute('data-gh')||'#';
          const li=r.getAttribute('data-li')||'#';
          const tw=r.getAttribute('data-tw')||'#';
          links[0].href=gh; links[1].href=li; links[2].href=tw;
        }
      },
      init(){
        const map={title:'data-title',bio:'data-bio',gh:'data-gh',li:'data-li',tw:'data-tw'};
        Object.entries(map).forEach(([t,a])=> this.on(`change:${t}`,(m,v)=> this.addAttributes({[a]:v})));
      }
    }
  });
  addBlock('bento-about','About Card',{ type:'bento-about' });

  // Newsletter
  dc.addType('bento-newsletter', {
    isComponent: el => el.classList?.contains('newsletter-card'),
    model: {
      defaults:{
        type:'bento-item',
        classes:['bento-item','bento-medium','newsletter-card'],
        components:`
          <div class="bento-content">
            <h4>Stay Updated</h4>
            <p>Get notified about new posts</p>
            <form class="newsletter-form">
              <input type="email" placeholder="you@example.com" class="email-input">
              <button type="submit" class="subscribe-btn"><i class="fas fa-paper-plane"></i></button>
            </form>
            <div class="subscriber-count"><i class="fas fa-users"></i> 0 subscribers</div>
          </div>`,
        traits:[
          {type:'text', name:'headline', label:'Headline'},
          {type:'text', name:'subcopy', label:'Sub copy'},
          {type:'number', name:'count', label:'Subscriber count'},
        ],
        script:function(){
          const r=this,$=s=>r.querySelector(s);
          $('h4').textContent = r.getAttribute('data-headline')||'Stay Updated';
          $('p').textContent = r.getAttribute('data-subcopy')||'Get notified about new posts';
          $('.subscriber-count').innerHTML = `<i class="fas fa-users"></i> ${r.getAttribute('data-count')||0} subscribers`;
        }
      },
      init(){
        const map={headline:'data-headline',subcopy:'data-subcopy',count:'data-count'};
        Object.entries(map).forEach(([t,a])=> this.on(`change:${t}`,(m,v)=> this.addAttributes({[a]:v})));
      }
    }
  });
  addBlock('bento-newsletter','Newsletter',{ type:'bento-newsletter' });

  // Topics (tags)
  dc.addType('bento-topics', {
    isComponent: el => el.classList?.contains('topics-card'),
    model: {
      defaults:{
        type:'bento-item',
        classes:['bento-item','bento-small','topics-card'],
        components:`
          <div class="bento-content">
            <h4>Popular Topics</h4>
            <div class="topic-tags">
              <span class="tag">AI/ML</span>
              <span class="tag">WebDev</span>
            </div>
          </div>`,
        traits:[
          {type:'text', name:'title', label:'Title'},
          {type:'text', name:'tags', label:'Tags (comma-separated)'},
        ],
        script:function(){
          const r=this,$=s=>r.querySelector(s);
          $('h4').textContent = r.getAttribute('data-title')||'Popular Topics';
          const tags = (r.getAttribute('data-tags')||'AI/ML,WebDev').split(',').map(t=>t.trim()).filter(Boolean);
          const wrap = $('.topic-tags'); wrap.innerHTML = tags.map(t=>`<span class="tag">${t}</span>`).join('');
        }
      },
      init(){
        const map={title:'data-title',tags:'data-tags'};
        Object.entries(map).forEach(([t,a])=> this.on(`change:${t}`,(m,v)=> this.addAttributes({[a]:v})));
      }
    }
  });
  addBlock('bento-topics','Topics',{ type:'bento-topics' });

  // Analytics
  dc.addType('bento-analytics', {
    isComponent: el => el.classList?.contains('analytics-card'),
    model: {
      defaults:{
        type:'bento-item',
        classes:['bento-item','bento-small','analytics-card'],
        components:`
          <div class="bento-content">
            <h4>This Month</h4>
            <div class="analytics-grid">
              <div class="metric"><span class="metric-value">12.4K</span><span class="metric-label">Views</span></div>
              <div class="metric"><span class="metric-value">86%</span><span class="metric-label">Engagement</span></div>
            </div>
          </div>`,
        traits:[
          {type:'text', name:'m1', label:'Metric 1 value'},
          {type:'text', name:'l1', label:'Metric 1 label'},
          {type:'text', name:'m2', label:'Metric 2 value'},
          {type:'text', name:'l2', label:'Metric 2 label'},
        ],
        script:function(){
          const r=this,$=s=>r.querySelector(s);
          const values = r.getAttribute('data-m1')||'12.4K';
          const labels = r.getAttribute('data-l1')||'Views';
          const v2 = r.getAttribute('data-m2')||'86%';
          const l2 = r.getAttribute('data-l2')||'Engagement';
          const metrics = r.querySelectorAll('.metric');
          metrics[0].querySelector('.metric-value').textContent = values;
          metrics[0].querySelector('.metric-label').textContent = labels;
          metrics[1].querySelector('.metric-value').textContent = v2;
          metrics[1].querySelector('.metric-label').textContent = l2;
        }
      },
      init(){
        const map={m1:'data-m1',l1:'data-l1',m2:'data-m2',l2:'data-l2'};
        Object.entries(map).forEach(([t,a])=> this.on(`change:${t}`,(m,v)=> this.addAttributes({[a]:v})));
      }
    }
  });
  addBlock('bento-analytics','Analytics',{ type:'bento-analytics' });

  // Activity
  dc.addType('bento-activity', {
    isComponent: el => el.classList?.contains('activity-card'),
    model: {
      defaults:{
        type:'bento-item',
        classes:['bento-item','bento-medium','activity-card'],
        components:`
          <div class="bento-content">
            <h4>Recent Activity</h4>
            <div class="activity-list">
              <div class="activity-item">
                <div class="activity-icon"><i class="fas fa-edit"></i></div>
                <div class="activity-text"><span>Updated article</span><time>2 hours ago</time></div>
              </div>
              <div class="activity-item">
                <div class="activity-icon"><i class="fas fa-heart"></i></div>
                <div class="activity-text"><span>Received likes</span><time>1 day ago</time></div>
              </div>
            </div>
          </div>`,
        traits:[
          {type:'text', name:'title', label:'Title'},
        ],
        script:function(){
          const r=this,$=s=>r.querySelector(s);
          $('h4').textContent = r.getAttribute('data-title')||'Recent Activity';
        }
      },
      init(){
        this.on('change:title',(m,v)=> this.addAttributes({'data-title':v}));
      }
    }
  });
  addBlock('bento-activity','Activity',{ type:'bento-activity' });
}
