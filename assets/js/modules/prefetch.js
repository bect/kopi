const seen = new Set();
let timer;

function injectLink(url) {
    if (seen.has(url)) return;
    seen.add(url);
    const prefetchLink = document.createElement('link');
    prefetchLink.rel = 'prefetch';
    prefetchLink.href = url;
    document.head.appendChild(prefetchLink);
}

function getUrlIfValid(target) {
    const link = target.closest('a');
    if (!link) return null;
    const url = link.href;
    if (link.origin !== location.origin || 
        url === location.href || 
        (link.hash && link.pathname === location.pathname) ||
        link.hasAttribute('data-no-prefetch') ||
        (link.hasAttribute('data-turbo-method') && link.getAttribute('data-turbo-method') !== 'get')) {
        return null;
    }
    return url;
}

// Global Event Listeners (Run Once)
document.addEventListener('mouseover', (e) => {
    const url = getUrlIfValid(e.target);
    if (!url) return;

    // Debounce to avoid prefetching on quick mouse movements
    timer = setTimeout(() => injectLink(url), 150);
});

document.addEventListener('touchstart', (e) => {
    const url = getUrlIfValid(e.target);
    if (url) injectLink(url);
}, { passive: true });

document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a')) {
        clearTimeout(timer);
    }
});

export function initPrefetch() {
    // Logic is handled by global listeners
}