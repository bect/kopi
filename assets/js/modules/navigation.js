export function initNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const dropdowns = document.querySelectorAll('.dropdown');

    function toggleMenu() {
        navLinks.classList.toggle('active');
        if(navLinks.classList.contains('active')) {
            menuToggle.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        } else {
            menuToggle.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
        }
    }

    if(menuToggle && navLinks) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }

    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('.dropdown-toggle');
        if(link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); 
                dropdowns.forEach(other => { if (other !== dropdown) other.classList.remove('active'); });
                dropdown.classList.toggle('active');
            });
        }
    });

    document.addEventListener('click', (e) => {
        if (navLinks && navLinks.classList.contains('active') && !navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
            toggleMenu();
        }
        dropdowns.forEach(dropdown => {
            if (dropdown.classList.contains('active') && !dropdown.contains(e.target)) dropdown.classList.remove('active');
        });
    });
}