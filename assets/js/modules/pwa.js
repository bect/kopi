export function initPWA() {
    if (!('serviceWorker' in navigator)) return;

    let refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        window.location.reload();
        refreshing = true;
    });

    navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(reg => {
        reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // Small delay to ensure smooth user experience
                        setTimeout(() => showUpdateToast(newWorker), 1000);
                    }
                });
            }
        });
    }).catch(err => console.error('Service Worker registration failed:', err));
}

function showUpdateToast(worker) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    // Prevent multiple update toasts
    const existingToast = container.querySelector('.update-toast');
    if (existingToast) return;

    const toast = document.createElement('div');
    toast.className = 'toast update-toast';
    toast.innerHTML = `
        <span>New version available</span>
        <div style="margin-left:auto; display:flex; gap:8px;">
            <button class="btn-dismiss" style="background:transparent; border:none; color:inherit; padding:4px 8px; border-radius:99px; font-size:0.8em; cursor:pointer; opacity:0.7;" aria-label="Dismiss update">×</button>
            <button class="btn-update" style="background:transparent; border:1px solid currentColor; color:inherit; padding:4px 10px; border-radius:99px; font-size:0.8em; cursor:pointer;" aria-label="Reload to update">Reload</button>
        </div>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    // Auto-dismiss after 30 seconds
    const autoDismiss = setTimeout(() => {
        dismissToast(toast);
    }, 30000);

    toast.querySelector('.btn-update').addEventListener('click', () => {
        clearTimeout(autoDismiss);
        worker.postMessage({ type: 'SKIP_WAITING' }).catch(err => console.error('Failed to skip waiting:', err));
    });

    toast.querySelector('.btn-dismiss').addEventListener('click', () => {
        clearTimeout(autoDismiss);
        dismissToast(toast);
    });
}

function dismissToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300); // Match transition duration
}
