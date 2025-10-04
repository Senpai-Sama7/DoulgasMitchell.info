import { bootUX } from '../frontend/lib/ux.js';

const htmlAttrs = new Map();
const listeners = {};
const observed = [];

const html = {
  getAttribute: (name) => htmlAttrs.get(name),
  setAttribute: (name, value) => htmlAttrs.set(name, value),
};

const themeBtn = {
  addEventListener: (event, handler) => {
    listeners[event] = handler;
  },
  click: () => {
    listeners.click?.({ type: 'click' });
  },
};

const tiles = [];

global.document = {
  documentElement: html,
  getElementById: (id) => (id === 'theme-btn' ? themeBtn : null),
  querySelectorAll: (selector) => {
    if(selector === '.bento-item'){ return tiles; }
    return [];
  },
  querySelector: () => null,
};

global.window = {};

global.localStorage = {
  data: new Map(),
  getItem(key){ return this.data.get(key); },
  setItem(key, value){ this.data.set(key, value); },
};

global.IntersectionObserver = class {
  constructor(cb){ this.cb = cb; }
  observe(el){ observed.push(el); }
  unobserve(el){ const idx = observed.indexOf(el); if(idx >= 0) observed.splice(idx, 1); }
};

const sampleTile = { classList: { add: (cls) => { sampleTile.added = cls; } } };
tiles.push(sampleTile);

bootUX();

const initialTheme = html.getAttribute('data-theme');

if(!initialTheme){
  throw new Error('Theme attribute was not initialized');
}

themeBtn.click();
const toggledTheme = html.getAttribute('data-theme');

console.log(JSON.stringify({ initialTheme, toggledTheme, localStorageTheme: global.localStorage.getItem('theme') ?? null, observedCount: observed.length }, null, 2));
