(() => {
  'use strict';

  const GA_ID = 'G-K1D72W9P67';
  const STORAGE_KEY = 'msc_cookie_consent_v1';
  const POLICY_VERSION = 1;
  const CONSENT_LIFETIME_MS = 180 * 24 * 60 * 60 * 1000;

  const banner = document.querySelector('#cookie-banner');
  const modalBackdrop = document.querySelector('#cookie-modal-backdrop');
  const modal = document.querySelector('#cookie-modal');
  const analyticsToggle = document.querySelector('#analytics-consent-toggle');
  let lastFocusedElement = null;

  function readConsent() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!value || value.version !== POLICY_VERSION || !value.savedAt) return null;
      if (Date.now() - value.savedAt > CONSENT_LIFETIME_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return value;
    } catch {
      return null;
    }
  }

  function saveConsent(analytics) {
    const value = { analytics: Boolean(analytics), savedAt: Date.now(), version: POLICY_VERSION };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch { /* Storage may be blocked. */ }
    applyConsent(value.analytics);
    hideBanner();
    closeModal();
  }

  function applyConsent(analytics) {
    window.gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: analytics ? 'granted' : 'denied'
    });

    if (analytics) {
      loadAnalytics();
    } else {
      clearAnalyticsCookies();
    }
  }

  function loadAnalytics() {
    if (window.__mscAnalyticsLoaded) return;
    window.__mscAnalyticsLoaded = true;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    script.onload = () => {
      window.gtag('js', new Date());
      window.gtag('config', GA_ID, {
        send_page_view: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false
      });
    };
    document.head.appendChild(script);
  }

  function clearAnalyticsCookies() {
    const cookieNames = document.cookie
      .split(';')
      .map(cookie => cookie.split('=')[0].trim())
      .filter(name => name === '_ga' || name.startsWith('_ga_'));

    const host = location.hostname.replace(/^www\./, '');
    const domains = ['', location.hostname, `.${host}`];
    cookieNames.forEach(name => {
      domains.forEach(domain => {
        const domainPart = domain ? `; domain=${domain}` : '';
        document.cookie = `${name}=; Max-Age=0; path=/${domainPart}; SameSite=Lax`;
      });
    });
  }

  function showBanner() {
    if (!banner) return;
    banner.hidden = false;
    requestAnimationFrame(() => banner.classList.add('is-visible'));
  }

  function hideBanner() {
    if (!banner) return;
    banner.classList.remove('is-visible');
    window.setTimeout(() => { banner.hidden = true; }, 220);
  }


  function openModal() {
    if (!modalBackdrop || !modal) return;
    const stored = readConsent();
    analyticsToggle.checked = Boolean(stored?.analytics);
    lastFocusedElement = document.activeElement;
    modalBackdrop.hidden = false;
    document.body.classList.add('cookie-modal-open');
    requestAnimationFrame(() => {
      modalBackdrop.classList.add('is-visible');
      modal.focus();
    });
  }

  function closeModal() {
    if (!modalBackdrop || modalBackdrop.hidden) return;
    modalBackdrop.classList.remove('is-visible');
    document.body.classList.remove('cookie-modal-open');
    window.setTimeout(() => { modalBackdrop.hidden = true; }, 180);
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') lastFocusedElement.focus();
  }

  function handleConsentAction(action) {
    if (action === 'accept') saveConsent(true);
    if (action === 'reject') saveConsent(false);
    if (action === 'settings') openModal();
    if (action === 'save') saveConsent(analyticsToggle.checked);
  }

  document.addEventListener('click', event => {
    const consentButton = event.target.closest('[data-consent]');
    if (consentButton) handleConsentAction(consentButton.dataset.consent);

    if (event.target.closest('[data-cookie-settings]')) openModal();
    if (event.target.closest('[data-cookie-close]')) closeModal();
    if (event.target === modalBackdrop) closeModal();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modalBackdrop && !modalBackdrop.hidden) closeModal();
  });

  const stored = readConsent();
  if (stored) {
    applyConsent(stored.analytics);
  } else {
    showBanner();
  }
})();
