'use strict';
console.log('register.js is loaded.');

const swURL = './service-worker.js';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register(swURL);
      console.log('Service worker registerd!', reg);
    } catch (err) {
      console.error('Service worker registration failed:', err);
    }
  });
}