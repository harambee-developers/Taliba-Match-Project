export const CACHE_EXPIRY = 10 * 60 * 1000; // Cache expires in 10 min

export async function cacheData(key, data, cacheId) {
    const cache = await caches.open(cacheId);
    const response = new Response(JSON.stringify({ data, timestamp: Date.now() }), {
        headers: { "Content-Type": "application/json" },
    });
    await cache.put(key, response);
}

export async function getCachedData(key, cacheId) {
    const cache = await caches.open(cacheId);
    const response = await cache.match(key);
    if (!response) return null;
    const { data, timestamp } = await response.json();
    return Date.now() - timestamp < CACHE_EXPIRY ? data : null;
}