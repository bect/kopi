const CACHE_VERSION = '{{ now.Unix }}';
const STATIC_CACHE = `kopi-static-${CACHE_VERSION}`;
const IMAGE_CACHE = 'kopi-images';

const PRECACHE_URLS = ['/', '/library/', '{{ .css }}', '{{ .js }}'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            const validUrls = PRECACHE_URLS.filter(url => url && !url.includes('{{ "{{" }}'));
            return cache.addAll(validUrls).catch(() => {});
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            const cacheNames = await caches.keys();
            const imageCache = await caches.open(IMAGE_CACHE);
            
            await Promise.all(
                cacheNames.map(async (cacheName) => {
                    // Identify old caches (starts with kopi-, not current static, not image cache)
                    if (cacheName.startsWith('kopi-') && cacheName !== STATIC_CACHE && cacheName !== IMAGE_CACHE) {
                        const oldCache = await caches.open(cacheName);
                        const requests = await oldCache.keys();
                        
                        // Migrate images to persistent cache
                        await Promise.all(requests.map(async (request) => {
                            const url = new URL(request.url);
                            if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|webp|svg|gif)$/i)) {
                                const response = await oldCache.match(request);
                                if (response) await imageCache.put(request, response);
                            }
                        }));
                        
                        return caches.delete(cacheName);
                    }
                })
            );
            await self.clients.claim();
        })()
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    const isImage = event.request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|webp|svg|gif)$/i);
    const isAudio = event.request.destination === 'audio' || url.pathname.match(/\.(mp3|m4a|wav|ogg|aac)$/i) || url.href.includes('listen/');

    // Don't intercept audio streams - let them pass through directly
    if (isAudio) return;

    if (isImage) {
        event.respondWith(
            caches.open(IMAGE_CACHE).then(async (cache) => {
                const cachedResponse = await cache.match(event.request);
                return cachedResponse || fetch(event.request, { cache: 'reload' }).then((response) => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            })
        );
        return;
    }

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request, { cache: 'reload' }).then((response) => {
                // Only cache successful responses
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(STATIC_CACHE).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }

                // Mask 404 as 200 for Turbo to preserve permanent elements
                if (response.status === 404) {
                    return new Response(response.body, {
                        status: 200,
                        statusText: 'OK',
                        headers: response.headers
                    });
                }

                return response;
            }).catch(async () => {
                // Network failed, try cache
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) return cachedResponse;

                // Cache miss, fallback to /library/
                const fallback = await caches.match('/library/');
                if (fallback) return fallback;

                throw new Error('Network and cache failed');
            })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;

            return fetch(event.request, { cache: 'reload' }).then((response) => {
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(STATIC_CACHE).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
        })
    );
});
