let searchIndex = [];

self.onmessage = async function(e) {
    const { type, payload } = e.data;

    if (type === 'init') {
        try {
            const response = await fetch('/index.json');
            searchIndex = await response.json();
            self.postMessage({ type: 'ready' });
        } catch (error) {
            console.error('Failed to load search index:', error);
        }
    } else if (type === 'search') {
        const query = payload.toLowerCase();
        if (!query) {
            self.postMessage({ type: 'results', payload: [] });
            return;
        }

        let results = searchIndex.filter(item => {
            const title = item.title.toLowerCase();
            const summary = item.summary ? item.summary.toLowerCase() : '';
            const tags = item.tags ? item.tags.join(' ').toLowerCase() : '';
            
            return title.includes(query) || 
                   summary.includes(query) ||
                   tags.includes(query);
        }).slice(0, 10); // Limit results

        // Fallback to fuzzy search if no results found
        if (results.length === 0 && query.length > 2) {
            results = fuzzySearch(query, searchIndex).slice(0, 5);
        }

        self.postMessage({ type: 'results', payload: results });
    }
};

function getLevenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1  // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

function fuzzySearch(query, index) {
    const queryWords = query.split(/\s+/);
    
    return index.filter(item => {
        const titleWords = item.title.toLowerCase().split(/\s+/);
        const tags = item.tags ? item.tags.map(t => t.toLowerCase()) : [];
        const targets = [...titleWords, ...tags];
        
        return queryWords.some(qWord => {
            if (qWord.length < 3) return false;
            return targets.some(target => {
                if (Math.abs(target.length - qWord.length) > 2) return false;
                const dist = getLevenshteinDistance(qWord, target);
                return dist <= (qWord.length > 5 ? 2 : 1);
            });
        });
    });
}