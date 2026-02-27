(() => {
  const intro = document.getElementById('intro');
  const siteRoot = document.getElementById('site-root');

  if (!intro || !siteRoot) return;

  // Change this string to customize the intro wordmark text.
  const brandText = 'QArchitettura';
  const brandEl = intro.querySelector('.intro__brand');
  if (brandEl) brandEl.textContent = brandText;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cssVarMs = (name, fallback) => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (!raw) return fallback;
    if (raw.endsWith('ms')) return parseFloat(raw);
    if (raw.endsWith('s')) return parseFloat(raw) * 1000;
    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  // Timing controls live in styles.css :root variables.
  const windowDelay = cssVarMs('--intro-window-delay', 900);
  const windowDuration = cssVarMs('--intro-window-duration', 680);
  const fadeDuration = cssVarMs('--intro-fade-duration', 420);

  const holdMs = prefersReduced ? 200 : 0;
  const fadeStartAt = prefersReduced ? holdMs : windowDelay + windowDuration - 120;

  const disableRoot = () => {
    siteRoot.setAttribute('aria-hidden', 'true');
    if ('inert' in siteRoot) siteRoot.inert = true;
  };

  const enableRoot = () => {
    siteRoot.removeAttribute('aria-hidden');
    if ('inert' in siteRoot) siteRoot.inert = false;
  };

  const finishIntro = () => {
    intro.classList.remove('is-playing', 'is-fading');
    intro.classList.add('is-done');
    intro.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('intro-lock');
    enableRoot();

    // Keep DOM clean from overlay interactions after the animation.
    setTimeout(() => {
      intro.remove();
    }, 50);
  };

  disableRoot();
  intro.classList.add('is-playing');

  setTimeout(() => {
    intro.classList.add('is-fading');
  }, Math.max(0, fadeStartAt));

  setTimeout(finishIntro, Math.max(fadeStartAt + fadeDuration, holdMs + 180));
})();
