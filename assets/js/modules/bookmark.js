import { showToast } from './toast.js';

// --- Helper Functions ---
const getBookmarks = () => JSON.parse(localStorage.getItem('kopi_bookmarks') || '[]');
const saveBookmarks = (bookmarks) => localStorage.setItem('kopi_bookmarks', JSON.stringify(bookmarks));

const updateButtonState = (btn) => {
    const bookmarks = getBookmarks();
    const svg = btn.querySelector('svg');
    if (bookmarks.some(b => b.url === btn.dataset.url)) {
        btn.classList.add('saved');
        if(svg) svg.style.fill = 'currentColor';
    } else {
        btn.classList.remove('saved');
        if(svg) svg.style.fill = 'none';
    }
};

function renderLibrary() {
    const container = document.getElementById('library-container');
    if (!container) return;
    
    const bookmarks = getBookmarks();
    if (bookmarks.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 0; color: var(--text-muted);">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                <h3>Your library is empty</h3>
                <p>Save articles to read them later, even when offline.</p>
                <a href="/" class="btn" style="margin-top: 1rem;">Browse Articles</a>
            </div>`;
        return;
    }
    
    container.innerHTML = bookmarks.map((post, index) => `
        <article class="post-card ${!post.image ? 'text-only' : ''}">
            ${post.image ? `<img src="${post.image}" class="post-image" alt="${post.title}" ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}>` : ''}
            <div class="post-content">
                <div class="post-meta">${post.date}</div>
                <h2 class="post-title"><a href="${post.url}">${post.title}</a></h2>
                ${!post.image ? `<p class="post-excerpt">${post.summary}</p>` : ''}
                <div class="post-footer" style="margin-top: auto; width: 100%;">
                    <a href="${post.url}" class="btn" style="border:none; padding-left:0; color:var(--accent);">Read Article →</a>
                    <div class="post-actions" style="margin-left: auto;">
                        <button class="btn-icon-action btn-bookmark saved" 
                            data-url="${post.url}" 
                            data-title="${post.title}"
                            aria-label="Remove from library">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        </article>
    `).join('');
}

async function openKopiCache() {
    if (!('caches' in window)) return null;
    const keys = await caches.keys();
    const cacheName = keys.find(k => k.startsWith('kopi-static-')) || keys.find(k => k.startsWith('kopi-')) || 'kopi-v1';
    return caches.open(cacheName);
}

// --- Global Event Listeners (Run Once) ---
document.addEventListener('click', (e) => {
    // Bookmark Logic
    const btnBookmark = e.target.closest('.btn-bookmark');
    if (btnBookmark) {
        e.preventDefault();
        e.stopPropagation();
        
        const bookmarks = getBookmarks();
        const url = btnBookmark.dataset.url;
        const isSaved = bookmarks.some(b => b.url === url);
        
        if (isSaved) {
            const newBookmarks = bookmarks.filter(b => b.url !== url);
            saveBookmarks(newBookmarks);
            
            openKopiCache().then(cache => {
                if(cache) {
                    cache.delete(url);
                    if (btnBookmark.dataset.image) cache.delete(btnBookmark.dataset.image);
                }
            });
            showToast('Removed from library');
        } else {
            bookmarks.push({ title: btnBookmark.dataset.title, url: btnBookmark.dataset.url, date: btnBookmark.dataset.date, summary: btnBookmark.dataset.summary || '', image: btnBookmark.dataset.image || '' });
            saveBookmarks(bookmarks);
            
            showToast('Downloading...');
            openKopiCache().then(cache => {
                if(cache) {
                    const urls = [url];
                    if (btnBookmark.dataset.image) urls.push(btnBookmark.dataset.image);
                    return cache.addAll(urls);
                }
            }).then(() => showToast('Saved & Downloaded')).catch(() => showToast('Saved (Offline content unavailable)'));
        }
        
        document.querySelectorAll(`.btn-bookmark[data-url="${url}"]`).forEach(updateButtonState);
        if (document.getElementById('library-container')) renderLibrary();
    }
});

export function initBookmark() {
    document.querySelectorAll('.btn-bookmark').forEach(updateButtonState);
    renderLibrary();
}