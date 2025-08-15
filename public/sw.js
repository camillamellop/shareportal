const CACHE_NAME = 'portal-share-brasil-v5';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Instala e pré-cacheia o shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// Ativa e remove caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.map((name) => (name !== CACHE_NAME ? caches.delete(name) : undefined))
      )
    )
  );
  self.clients.claim();
});

// Estratégias de fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // 1) Ignora tudo que não for GET (POST/PUT/DELETE, etc.)
  if (request.method !== 'GET') return;

  // 2) Ignora esquemas não suportados (chrome-extension:, chrome:, edge:, file:, etc.)
  if (!url.startsWith('http')) return;

  // 3) Navegação (SPA): network-first com fallback para index.html do cache
  const isNavigationRequest =
    request.mode === 'navigate' ||
    (request.headers.get('accept') || '').includes('text/html');

  if (isNavigationRequest) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Se deu certo, atualiza o cache da raiz para manter o shell fresco (opcional)
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put('/', copy).catch(() => {}); // protege contra erros
          });
          return response;
        })
        .catch(async () => {
          // Offline / falha de rede: tenta o index do cache
          const cached = await caches.match('/');
          return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
        })
    );
    return;
  }

  // 4) Demais requisições (JS, CSS, imagens, fontes): cache-first com atualização
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((networkResponse) => {
          // Não cacheia respostas inválidas/erro
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== 'basic'
          ) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();

          // Protege o cache.put com try/catch (pode falhar por quota, etc.)
          caches.open(CACHE_NAME).then((cache) => {
            try {
              cache.put(request, responseToCache);
            } catch (e) {
              // Silencia erros de put (ex.: Request não clonável, quota, etc.)
              // console.debug('Cache put error:', e);
            }
          });

          return networkResponse;
        })
        .catch(() => {
          // Opcional: fallback por tipo (ex.: imagens) quando offline
          // if (request.destination === 'image') return caches.match('/img/fallback.png');
          return caches.match(request); // última tentativa
        });
    })
  );
});
