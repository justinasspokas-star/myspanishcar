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
  
  function setupLanguageSwitcher() {
    const headerActions = document.querySelector('.header-actions');
    if (!headerActions || document.querySelector('.language-switcher')) return;

    const path = window.location.pathname.replace(/\/index\.html$/, '/');
    const isNl = path.startsWith('/nl/');

    const pairs = {
      '/': '/nl/auto-huren-spanje-zonder-creditcard/',
      '/car-rental-spain-with-debit-card.html': '/nl/auto-huren-spanje-zonder-creditcard/',
      '/car-rental-spain-without-credit-card.html': '/nl/auto-huren-spanje-zonder-creditcard/',
      '/car-rental-spain-low-deposit.html': '/nl/auto-huren-spanje-zonder-creditcard/',
      '/madrid-airport-car-rental.html': '/nl/auto-huren-madrid-zonder-creditcard/',
      '/palma-airport-car-rental.html': '/nl/auto-huren-palma-zonder-creditcard/',
      '/seville-airport-car-rental.html': '/nl/auto-huren-sevilla-zonder-creditcard/',
      '/tenerife-south-airport-car-rental.html': '/nl/auto-huren-tenerife-zonder-creditcard/'
    };

    const reversePairs = Object.fromEntries(Object.entries(pairs).map(([en, nl]) => [nl, en]));
    const enHref = isNl
      ? (reversePairs[path] || '/car-rental-spain-without-credit-card.html')
      : path;
    const nlHref = isNl
      ? path
      : (pairs[path] || '/nl/auto-huren-spanje-zonder-creditcard/');

    const buildSwitcher = (mobile = false) => {
      const nav = document.createElement('nav');
      nav.className = 'language-switcher' + (mobile ? ' language-switcher-mobile' : '');
      nav.setAttribute('aria-label', isNl ? 'Taal kiezen' : 'Choose language');

      const en = document.createElement('a');
      en.href = enHref;
      en.textContent = 'EN';
      en.lang = 'en';
      en.hreflang = 'en';
      en.setAttribute('aria-label', 'English');
      if (!isNl) {
        en.classList.add('is-active');
        en.setAttribute('aria-current', 'page');
      }

      const divider = document.createElement('span');
      divider.className = 'language-divider';
      divider.setAttribute('aria-hidden', 'true');
      divider.textContent = '|';

      const nl = document.createElement('a');
      nl.href = nlHref;
      nl.textContent = 'NL';
      nl.lang = 'nl';
      nl.hreflang = 'nl';
      nl.setAttribute('aria-label', 'Nederlands');
      if (isNl) {
        nl.classList.add('is-active');
        nl.setAttribute('aria-current', 'page');
      }

      nav.append(en, divider, nl);
      return nav;
    };

    const style = document.createElement('style');
    style.id = 'msc-language-switcher-styles';
    style.textContent = `
      .language-switcher{display:flex;align-items:center;gap:5px;padding:4px;border:1px solid #dce5ef;border-radius:10px;background:#fff;box-shadow:0 5px 14px rgba(15,39,71,.06);white-space:nowrap}
      .language-switcher a{display:flex;align-items:center;justify-content:center;min-width:31px;height:28px;padding:0 7px;border-radius:7px;color:#415064;font-size:.72rem;font-weight:850;letter-spacing:.04em;line-height:1;text-decoration:none}
      .language-switcher a:hover{color:#0F2747;background:#f4f8fc}
      .language-switcher a.is-active{background:#0F2747;color:#fff}
      .language-switcher .language-divider{color:#a8b4c2;font-size:.67rem;font-weight:700}
      .language-switcher-mobile{display:none}
      @media(max-width:1020px){
        .header-actions>.language-switcher{display:none}
        .mobile-nav-inner .language-switcher-mobile{display:flex;justify-self:start;margin:6px 0 8px;padding:4px}
      }
      @media(max-width:700px){
        .mobile-nav-inner .language-switcher-mobile{margin-left:1px}
      }
    `;
    if (!document.querySelector('#msc-language-switcher-styles')) document.head.appendChild(style);

    const desktopSwitcher = buildSwitcher(false);
    headerActions.insertBefore(desktopSwitcher, headerActions.firstChild);

    const mobileInner = document.querySelector('.mobile-nav-inner');
    if (mobileInner) {
      const mobileSwitcher = buildSwitcher(true);
      const mobileCta = mobileInner.querySelector('.mobile-nav-cta');
      if (mobileCta) mobileInner.insertBefore(mobileSwitcher, mobileCta);
      else mobileInner.appendChild(mobileSwitcher);
    }
  }

  setupLanguageSwitcher();

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
