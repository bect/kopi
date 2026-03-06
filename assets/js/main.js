import { initNavigation } from './modules/navigation.js';
import { initTheme } from './modules/theme.js';
import { initRadio } from './modules/radio.js';
import { initInteractions } from './modules/interactions.js';
import { initSearch } from './modules/search.js';
import { initBookmark } from './modules/bookmark.js';
import { initPWA } from './modules/pwa.js';
import { initPrefetch } from './modules/prefetch.js';
import './external/turbo.es2017-umd.js';

document.addEventListener('turbo:load', () => {
    initNavigation();
    initTheme();
    initRadio();
    initInteractions();
    initSearch();
    initBookmark();
    initPWA();
    initPrefetch();
});
