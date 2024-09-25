'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "8efb33c6765cb24470cb1b067c1fc69b",
"assets/AssetManifest.bin.json": "1d873d42ba6d2f24d1d76c005d58250d",
"assets/AssetManifest.json": "01dd5b1093b40504da8bf526d2d4ef1d",
"assets/FontManifest.json": "a3badc468c0807054fd6968c12ba55fc",
"assets/fonts/MaterialIcons-Regular.otf": "4ee6206092cd0d46409ae53c8b578033",
"assets/lib/assets/fonts/IBMPlexSans-Bold.ttf": "1ae7d0a8e83337da66631aeca59fbb02",
"assets/lib/assets/fonts/IBMPlexSans-BoldItalic.ttf": "5c7054fd77f5371213e6bd40ba413007",
"assets/lib/assets/fonts/IBMPlexSans-ExtraLight.ttf": "4362bbf9009288efcbd3130c5ac8f671",
"assets/lib/assets/fonts/IBMPlexSans-ExtraLightItalic.ttf": "d09511dbf61a5625e6296f7e536b7dd3",
"assets/lib/assets/fonts/IBMPlexSans-Italic.ttf": "291a8d32d7596f69509713e0d31e1eb7",
"assets/lib/assets/fonts/IBMPlexSans-Light.ttf": "abcc0987be49b417483f65063f144e4a",
"assets/lib/assets/fonts/IBMPlexSans-LightItalic.ttf": "f059e141654e87fe1ec2180873970da7",
"assets/lib/assets/fonts/IBMPlexSans-Medium.ttf": "361336a2ed1908c5cd8dec2e10aa71a2",
"assets/lib/assets/fonts/IBMPlexSans-MediumItalic.ttf": "77fbc569f8e2c0cecd7d1317eba8cce8",
"assets/lib/assets/fonts/IBMPlexSans-Regular.ttf": "1286abb632c5a409a0a997d11c994e34",
"assets/lib/assets/fonts/IBMPlexSans-SemiBold.ttf": "3ea7eea66304ac5e02a95265505300fd",
"assets/lib/assets/fonts/IBMPlexSans-SemiBoldItalic.ttf": "c7e16f251b21174781a036ecc37fb301",
"assets/lib/assets/fonts/IBMPlexSans-Thin.ttf": "6dcbea439f36a796c36e5197a527c8a1",
"assets/lib/assets/fonts/IBMPlexSans-ThinItalic.ttf": "9823c5872a073bda1d37e35b8d518912",
"assets/lib/assets/reach.png": "cb53cbae3a60cfdf7206bf2e4e112b59",
"assets/lib/assets/ReachApp.png": "eba7e75d761b1973c32537d29b2e13ee",
"assets/NOTICES": "b9dbac9e4ced2539364e17ee8b511f60",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "9b3bf5dff6f07949007ec6baffe6245f",
"assets/shaders/ink_sparkle.frag": "4096b5150bac93c41cbc9b45276bd90f",
"canvaskit/canvaskit.js": "eb8797020acdbdf96a12fb0405582c1b",
"canvaskit/canvaskit.wasm": "73584c1a3367e3eaf757647a8f5c5989",
"canvaskit/chromium/canvaskit.js": "0ae8bbcc58155679458a0f7a00f66873",
"canvaskit/chromium/canvaskit.wasm": "143af6ff368f9cd21c863bfa4274c406",
"canvaskit/skwasm.js": "87063acf45c5e1ab9565dcf06b0c18b8",
"canvaskit/skwasm.wasm": "2fc47c0a0c3c7af8542b601634fe9674",
"canvaskit/skwasm.worker.js": "bfb704a6c714a75da9ef320991e88b03",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"flutter.js": "59a12ab9d00ae8f8096fffc417b6e84f",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"index.html": "c269b79d9086ae24881936605b551226",
"/": "c269b79d9086ae24881936605b551226",
"main.dart.js": "fb55fdabd474343a6c44d3c8ea62779c",
"manifest.json": "e67a6bc5cad2eb8e0a49f531baf02e20",
"version.json": "8ee92dbd1f2c78608b34ca781b03fba4"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
