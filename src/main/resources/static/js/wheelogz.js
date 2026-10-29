document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.getElementById('journal-nav');
    const close = () => {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.querySelector('span').textContent = '+';
        nav.classList.remove('is-open');
    };
    toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', String(open));
        toggle.querySelector('span').textContent = open ? '−' : '+';
        nav.classList.toggle('is-open', open);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && nav.classList.contains('is-open')) { close(); toggle.focus(); }
    });
    document.addEventListener('click', event => { if (!event.target.closest('.journal-header')) close(); });
    window.matchMedia('(min-width: 641px)').addEventListener('change', close);

    const release = document.querySelector('[data-video-release]');
    if (!release || !release.dataset.videoRelease) return;
    const availableAt = Date.parse(release.dataset.videoRelease);
    if (!Number.isFinite(availableAt)) return;
    let timer;
    const updateRelease = () => {
        clearTimeout(timer);
        const remaining = availableAt - Date.now();
        if (remaining <= 0) {
            release.querySelector('[data-watch-link]').hidden = false;
            release.querySelector('[data-scheduled-message]').hidden = true;
        } else {
            timer = setTimeout(updateRelease, Math.min(remaining, 2147483647));
        }
    };
    updateRelease();
    document.addEventListener('visibilitychange', () => { if (!document.hidden) updateRelease(); });
});
