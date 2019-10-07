export default () => {
  // Install service worker
  if ('serviceWorker' in window.navigator) {
    window.addEventListener('load', () => {
      window.navigator.serviceWorker.register('/serviceWorker.js').then(
        (reg) => console.log('SW registered: ', reg),
        (err) => console.log('SW registration failed: ', err)
      );
    });
  }
}
