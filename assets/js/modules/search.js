export function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const pageTitle = document.querySelector('.search-title');
    
    if (!searchInput || !searchResults) return;

    const workerUrl = searchInput.dataset.workerUrl;
    if (!workerUrl) return;

    const worker = new Worker(workerUrl);
    worker.postMessage({ type: 'init' });

    let debounceTimer;

    const updateTitle = (query) => {
        if (query) {
            const title = `Search results for "${query}"`;
            document.title = title;
            if (pageTitle) pageTitle.textContent = title;
        } else {
            const title = 'Search';
            document.title = title;
            if (pageTitle) pageTitle.textContent = title;
        }
    };

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (query.length > 2) {
                updateTitle(query);
                const url = new URL(window.location);
                url.searchParams.set('q', query);
                window.history.replaceState({}, '', url);
                worker.postMessage({ type: 'search', payload: query });
            } else {
                updateTitle('');
                const url = new URL(window.location);
                url.searchParams.delete('q');
                window.history.replaceState({}, '', url);
                searchResults.classList.remove('active');
                searchResults.innerHTML = '';
            }
        }, 300);
    });

    worker.onmessage = (e) => {
        const { type, payload } = e.data;
        
        if (type === 'results') {
            renderResults(payload);
        } else if (type === 'ready') {
            const params = new URLSearchParams(window.location.search);
            const query = params.get('q');
            if (query) {
                searchInput.value = query;
                updateTitle(query);
                worker.postMessage({ type: 'search', payload: query });
            }
        }
    };

    function renderResults(results) {
        if (results.length > 0) {
            searchResults.innerHTML = results.map(item => `
                <a href="${item.permalink}" class="search-result-item">
                    <span class="search-result-title">${item.title}</span>
                    <span class="search-result-excerpt">${item.summary || ''}</span>
                </a>
            `).join('');
        } else {
            searchResults.innerHTML = '<div class="search-no-results">No results found</div>';
        }
        searchResults.classList.add('active');
    }

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });
}