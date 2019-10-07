// It does nothing but satisfies PWA requirement.
self.addEventListener('fetch', (event) => {
  let responsePromise = caches.match(event.request).then(
      (response) => response || fetch(event.request)
  );
  event.respondWith(responsePromise);
});
