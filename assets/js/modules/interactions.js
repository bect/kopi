import { showToast } from './toast.js';

// --- Helper Functions (Module Scope) ---
function getLightbox() {
    let lightbox = document.getElementById('imageLightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'imageLightbox';
        lightbox.className = 'lightbox-overlay';
        lightbox.innerHTML = '<img class="lightbox-image" src="" alt="Zoomed Image">';
        document.body.appendChild(lightbox);
        
        lightbox.addEventListener('click', () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    return lightbox;
}

// --- Global Event Listeners (Run Once) ---
document.addEventListener('click', (e) => {
    // Copy Link Logic
    const btnCopy = e.target.closest('.btn-copy-link');
    if (btnCopy) {
        const url = btnCopy.dataset.url || window.location.href;
        navigator.clipboard.writeText(url).then(() => showToast('Link copied to clipboard!'));
        return;
    }

    // Native Share Logic
    const btnShare = e.target.closest('.btn-share-native');
    if (btnShare) {
        const shareData = {
            title: btnShare.dataset.title,
            url: btnShare.dataset.url
        };
        if (navigator.share) {
            navigator.share(shareData).catch(() => {});
        } else {
            navigator.clipboard.writeText(shareData.url).then(() => showToast('Link copied to clipboard!'));
        }
        return;
    }

    // Code Block Copy
    const btnCodeCopy = e.target.closest('.copy-code-btn');
    if (btnCodeCopy) {
        const wrapper = btnCodeCopy.closest('.code-block-wrapper');
        const codeElement = wrapper.querySelector('code') || wrapper.querySelector('pre');
        
        if (codeElement) {
            navigator.clipboard.writeText(codeElement.textContent).then(() => {
                const originalText = btnCodeCopy.textContent;
                btnCodeCopy.textContent = 'Copied!';
                setTimeout(() => btnCodeCopy.textContent = originalText, 2000);
            });
        }
        return;
    }

    // Mermaid Tabs
    const mermaidHeader = e.target.closest('.mermaid-tab-header');
    if (mermaidHeader) {
        const wrapper = mermaidHeader.closest('.code-block-wrapper');
        const tabId = mermaidHeader.dataset.tab;
        
        wrapper.querySelectorAll('.mermaid-tab-header').forEach(h => h.classList.remove('active'));
        mermaidHeader.classList.add('active');
        
        wrapper.querySelectorAll('.mermaid-tab-content').forEach(c => c.classList.remove('active'));
        const content = document.getElementById(tabId);
        if(content) content.classList.add('active');
        return;
    }

    // Image Lightbox
    const zoomableImg = e.target.closest('.zoomable');
    if (zoomableImg) {
        e.stopPropagation();
        const lightbox = getLightbox();
        const lightboxImg = lightbox.querySelector('.lightbox-image');
        lightboxImg.src = zoomableImg.dataset.fullUrl || zoomableImg.src;
        lightboxImg.alt = zoomableImg.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
});

export function initInteractions() {
    // Back to Top
    const backToTopBtn = document.getElementById('backToTop');
    if(backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) backToTopBtn.classList.add('visible');
            else backToTopBtn.classList.remove('visible');
        });
        backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // Category Filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
    });

    // Subscribe Buttons
    document.querySelectorAll('.btn-subscribe').forEach(btn => {
        btn.addEventListener('click', () => showToast('Subscribed successfully!'));
    });

    // Cookie Banner
    const cookieBanner = document.getElementById('cookieBanner');
    if (cookieBanner && !localStorage.getItem('cookiesAccepted')) {
        setTimeout(() => cookieBanner.classList.add('show'), 2000);
    }
    document.getElementById('btnAcceptCookies')?.addEventListener('click', () => {
        cookieBanner.classList.remove('show');
        localStorage.setItem('cookiesAccepted', 'true');
        showToast('Cookies accepted.');
    });
    document.getElementById('btnDeclineCookies')?.addEventListener('click', () => cookieBanner.classList.remove('show'));

    // Comment Form
    const commentForm = document.querySelector('.comment-form');
    if(commentForm) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Comment submitted for moderation');
            commentForm.reset();
        });
    }

    // Code Block Expansion
    document.querySelectorAll('.code-block-wrapper').forEach(wrapper => {
        const pre = wrapper.querySelector('pre');
        if (pre && pre.scrollHeight > 350) {
            wrapper.classList.add('collapsed');
            
            const btnContainer = document.createElement('div');
            btnContainer.className = 'code-expand-btn';
            btnContainer.innerHTML = '<button>Show More</button>';
            wrapper.appendChild(btnContainer);
            
            btnContainer.querySelector('button').addEventListener('click', () => {
                wrapper.classList.remove('collapsed');
                btnContainer.remove();
            });
        }
    });
}