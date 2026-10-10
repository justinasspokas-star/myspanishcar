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


/* MySpanishCar persistent language preference */
(() => {
  'use strict';

  const LANGUAGE_KEY = 'msc_language_v1';
  const normalizePath = (value) => {
    let path = value || '/';
    path = path.replace(/\/index\.html$/, '/');
    if (!path.startsWith('/')) path = '/' + path;
    return path;
  };

  const enToNl = {
    '/': '/nl/',
    '/malaga-airport-car-rental.html': '/nl/auto-huren-malaga-airport/',
    '/alicante-airport-car-rental.html': '/nl/auto-huren-alicante-airport/',
    '/barcelona-airport-car-rental.html': '/nl/auto-huren-barcelona-airport/',
    '/valencia-airport-car-rental.html': '/nl/auto-huren-valencia-airport/',
    '/madrid-airport-car-rental.html': '/nl/auto-huren-madrid-zonder-creditcard/',
    '/palma-airport-car-rental.html': '/nl/auto-huren-palma-zonder-creditcard/',
    '/seville-airport-car-rental.html': '/nl/auto-huren-sevilla-zonder-creditcard/',
    '/tenerife-south-airport-car-rental.html': '/nl/auto-huren-tenerife-zonder-creditcard/',
    '/centauro-car-rental-spain.html': '/nl/centauro-auto-huren-spanje/',
    '/car-rental-spain-with-debit-card.html': '/nl/auto-huren-spanje-met-debitcard/',
    '/car-rental-spain-without-credit-card.html': '/nl/auto-huren-spanje-zonder-creditcard/',
    '/car-rental-spain-low-deposit.html': '/nl/auto-huren-spanje-lage-borg/'
  };

  const nlToEn = {
    '/nl/': '/',
    '/nl/auto-huren-malaga-airport/': '/malaga-airport-car-rental.html',
    '/nl/auto-huren-alicante-airport/': '/alicante-airport-car-rental.html',
    '/nl/auto-huren-barcelona-airport/': '/barcelona-airport-car-rental.html',
    '/nl/auto-huren-valencia-airport/': '/valencia-airport-car-rental.html',
    '/nl/auto-huren-madrid-zonder-creditcard/': '/madrid-airport-car-rental.html',
    '/nl/auto-huren-palma-zonder-creditcard/': '/palma-airport-car-rental.html',
    '/nl/auto-huren-sevilla-zonder-creditcard/': '/seville-airport-car-rental.html',
    '/nl/auto-huren-tenerife-zonder-creditcard/': '/tenerife-south-airport-car-rental.html',
    '/nl/auto-huren-la-palma-zonder-creditcard/': '/',
    '/nl/centauro-auto-huren-spanje/': '/centauro-car-rental-spain.html',
    '/nl/auto-huren-spanje-met-debitcard/': '/car-rental-spain-with-debit-card.html',
    '/nl/auto-huren-spanje-zonder-creditcard/': '/car-rental-spain-without-credit-card.html',
    '/nl/auto-huren-spanje-lage-borg/': '/car-rental-spain-low-deposit.html'
  };

  const getPreference = () => {
    try { return localStorage.getItem(LANGUAGE_KEY); }
    catch { return null; }
  };

  const setPreference = (language) => {
    try { localStorage.setItem(LANGUAGE_KEY, language); }
    catch { /* Storage may be blocked. */ }
  };

  document.addEventListener('click', (event) => {
    const choice = event.target.closest('.language-switcher a[lang]');
    if (choice) {
      const language = choice.getAttribute('lang');
      if (language === 'en' || language === 'nl') setPreference(language);
      return;
    }

    const link = event.target.closest('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

    const preference = getPreference();
    if (preference !== 'en' && preference !== 'nl') return;

    let url;
    try { url = new URL(link.href, window.location.href); }
    catch { return; }

    if (url.origin !== window.location.origin) return;
    const path = normalizePath(url.pathname);

    if (preference === 'nl' && enToNl[path]) {
      event.preventDefault();
      window.location.href = enToNl[path] + url.search + url.hash;
    } else if (preference === 'en' && nlToEn[path]) {
      event.preventDefault();
      window.location.href = nlToEn[path] + url.search + url.hash;
    }
  });

  const preference = getPreference();
  const currentPath = normalizePath(window.location.pathname);

  if (preference === 'nl' && enToNl[currentPath]) {
    const destination = enToNl[currentPath];
    if (destination !== currentPath) window.location.replace(destination + window.location.search + window.location.hash);
  } else if (preference === 'en' && nlToEn[currentPath]) {
    const destination = nlToEn[currentPath];
    if (destination !== currentPath) window.location.replace(destination + window.location.search + window.location.hash);
  }
})();
/* END persistent language preference */
