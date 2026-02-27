(() => {
  const intro = document.getElementById('intro');
  const introLogo = document.getElementById('introLogo');
  const logoTarget = document.getElementById('logoTarget');
  const siteRoot = document.getElementById('site-root');

  if (!intro || !introLogo || !logoTarget || !siteRoot) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cssMs = (varName, fallback) => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (!raw) return fallback;
    if (raw.endsWith('ms')) return parseFloat(raw);
    if (raw.endsWith('s')) return parseFloat(raw) * 1000;
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : fallback;
  };

  // Tweak intro timing by editing CSS variables in styles.css (:root).
  const holdMs = cssMs('--intro-hold', 160);
  const moveMs = cssMs('--intro-move-duration', 900);
  const introEase = getComputedStyle(document.documentElement).getPropertyValue('--intro-ease').trim() || 'cubic-bezier(0.2, 0.8, 0.2, 1)';

  const disableSite = () => {
    document.body.classList.add('intro-lock');
    siteRoot.setAttribute('aria-hidden', 'true');
    if ('inert' in siteRoot) siteRoot.inert = true;
  };

  const enableSite = () => {
    document.body.classList.remove('intro-lock');
    siteRoot.removeAttribute('aria-hidden');
    if ('inert' in siteRoot) siteRoot.inert = false;
  };

  const finish = () => {
    logoTarget.style.opacity = '1';
    intro.classList.add('is-done');
    intro.setAttribute('aria-hidden', 'true');
    introLogo.style.willChange = 'auto';
    enableSite();
    setTimeout(() => intro.remove(), 40);
  };

  const skipIntro = () => {
    setTimeout(finish, Math.min(holdMs, 200));
  };

  const runFlip = () => {
    const firstRect = introLogo.getBoundingClientRect();
    const lastRect = logoTarget.getBoundingClientRect();

    if (!firstRect.width || !lastRect.width) {
      skipIntro();
      return;
    }

    // FLIP: freeze intro logo at "First", animate to "Last" (header target).
    Object.assign(introLogo.style, {
      left: `${firstRect.left}px`,
      top: `${firstRect.top}px`,
      width: `${firstRect.width}px`,
      height: `${firstRect.height}px`,
      transform: 'translate3d(0, 0, 0) scale(1, 1)',
      transformOrigin: 'top left'
    });

    const deltaX = lastRect.left - firstRect.left;
    const deltaY = lastRect.top - firstRect.top;
    const scaleX = lastRect.width / firstRect.width;
    const scaleY = lastRect.height / firstRect.height;

    setTimeout(() => {
      setTimeout(() => intro.classList.add('is-revealing'), 40);

      introLogo.animate(
        [
          { transform: 'translate3d(0, 0, 0) scale(1, 1)' },
          { transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scaleX}, ${scaleY})` }
        ],
        {
          duration: moveMs,
          easing: introEase,
          fill: 'forwards'
        }
      );

      setTimeout(finish, moveMs + 20);
    }, holdMs);
  };

  disableSite();

  if (reducedMotion) {
    skipIntro();
    return;
  }

  // Wait one frame so centered intro logo + header target have stable rects.
  requestAnimationFrame(() => {
    requestAnimationFrame(runFlip);
  });
})();
